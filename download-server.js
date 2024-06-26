const express = require('express');
require('dotenv').config();

const path = require('path');
const app = express();
const hostname = "::";
const port_download = process.env.port_download;
const redirection_path_download = process.env.redirection_path_download;
const root_path = process.env.root_path;
const range = require('range-parser');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const GridFSBucket = require('mongodb').GridFSBucket;
const uri = process.env.mongodb_uri;
const dbName = process.env.db_name;
const downloadsDirectory = path.join(__dirname, 'downloads');

const callbacks = {
    download_callback: undefined,
    download_callback_is_set: false,
};

// Function to establish connection to MongoDB
async function connectToDatabase() {
    try {
        //const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        //await client.connect();
	const client = await MongoClient.connect(uri);
        console.log('Connected to MongoDB database successfully.');
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        return null;
    }
}

// Function to download a file from MongoDB GridFS
async function downloadFile(fileId, filePath) {
    const client = await connectToDatabase();
    if (!client) {
        console.error('Failed to connect to MongoDB. Aborting file download.');
        return false;
    }

    try {
	//const filter = { filename: "order_20240313234342.wav" };
	//const coll = client.db(dbName).collection('fs.files');
	//const cursor = coll.find(filter);
	//const result = await cursor.toArray();
	//console.log(result)

        const db = client.db(dbName);
        const bucket = new GridFSBucket(db);
        const file = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
	//console.log(file)
	
        if (file.length === 0) {
            console.error('File not found.');
            return false; // Indicate that file was not found
        }

        // Ensure that the directory for saving the file exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Create a write stream to write the downloaded file
        const writeStream = fs.createWriteStream(filePath);

        // Open download stream using the file ID
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        // Pipe the download stream to the write stream
        downloadStream.pipe(writeStream);

        // Wait for the download to finish
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        /*
        const url=`https://lehre.bpm.in.tum.de/${redirection_path_download}/download/${fileId}`;
        console.log(url)
        axios.get(url).then(response => {
                console.log('GET request successful:');
        }).catch(error => {
                console.error('Error making GET request:', error.message);
        });
        */

        console.log('File downloaded successfully.');
        return true; // Indicate that file was downloaded successfully
    } catch (error) {
        console.error('Error downloading file:', error);
        return false; // Indicate error occurred while downloading file
    } finally {
        client.close(); // Close the client connection in the finally block
    }
}



app.post('/cpee_interface_download', async (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {
        const audio_object_id = req.body.audio_object_id
        console.log("audio_object_id:", audio_object_id);
        console.log("req.body:", req.body);

        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.download_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("download_callback:", callbacks.download_callback);
        callbacks.download_callback_is_set = true;

        // Wait for the signal (if needed)
        while (!callbacks.download_callback_is_set) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        callbacks.download_callback_is_set = false;
        const filePath = path.join(__dirname, 'wavs', `file_${audio_object_id}.wav`);


        // Call downloadFile function to download the file
        const downloadSuccess = await downloadFile(audio_object_id, filePath);

        // Check if file was downloaded successfully and send response accordingly
        if (downloadSuccess) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found.');
        }

        res.setHeader('CPEE-CALLBACK', 'true');
        const url=`https://lehre.bpm.in.tum.de/${redirection_path_download}/downloads/file_${audio_object_id}.wav`;
        console.log(url)
        // Send a callback request
        const payload = {
            //success: 'true',
            //audio_object_id: audio_object_id,
            url: url
        };
        axios.put(callbacks.download_callback, payload)
            .then(response => {
                console.log('download request successful:', response.data);
            })
            .catch(error => {
                console.error('Error making download request:', error.message);
            });

            /*
        var jsonData = {
            "download_foo": 1,
        };
        */
        res.send(payload)

    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});

// Middleware to serve WAV files with appropriate content-type and support range requests
app.get('/downloads/:filename', (req, res, next) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'wavs', filename);

    // Set appropriate content type for WAV files
    res.set('Content-Type', 'audio/x-wav');

    // Send the file
    res.sendFile(filePath, (err) => {
        if (err) {
            // If there is an error sending the file, pass it to the error handler middleware
            next(err);
        }
    });
});

app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.listen(port_download, hostname, () => {
    console.info(`port_download: ${port_download}`);
    console.info(`redirection_path_download: ${redirection_path_download}`);
    console.info(`root_path: ${root_path}`);
    console.info(`download-server running at http://${hostname}:${port_download}/`);
});
