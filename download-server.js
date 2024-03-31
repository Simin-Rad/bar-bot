const express = require('express');
require('dotenv').config();

const path = require('path');
const app = express();
const hostname = "::";
const port_download = process.env.port_download;
const redirection_path_download = process.env.redirection_path_download
const root_path = process.env.root_path

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const GridFSBucket = require('mongodb').GridFSBucket;
const uri = process.env.mongodb_uri;
const dbName = process.env.db_name;

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

        console.log('File downloaded successfully.');
        return true; // Indicate that file was downloaded successfully
    } catch (error) {
        console.error('Error downloading file:', error);
        return false; // Indicate error occurred while downloading file
    } finally {
        client.close(); // Close the client connection in the finally block
    }
}

// Endpoint to trigger file download
app.get('/download/:id', async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send('No ID in params');
    }
    
    try {
        // Log the headers (if needed)
        const headers = req.headers;
        const formattedHeaders = JSON.stringify(headers, null, 2);
        console.log("Headers:", formattedHeaders);

        // Wait for the signal (if needed)
        while (!callbacks.download_callback_is_set) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        callbacks.download_callback_is_set = false;

        const fileId = req.params.id;
        const filePath = path.join(__dirname, 'downloads', `file_${fileId}.wav`);
        
        // Call downloadFile function to download the file
        const downloadSuccess = await downloadFile(fileId, filePath);

        // Check if file was downloaded successfully and send response accordingly
        if (downloadSuccess) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found.');
        }

        // Send a callback request
        const payload = {
            success: 'true',
	        audio_object_id: fileId 
        };
        axios.put(callbacks.download_callback, payload)
            .then(response => {
                console.log('download request successful:', response.data);
            })
            .catch(error => {
                console.error('Error making download request:', error.message);
            });
        // Respond for successful audio download

        res.json({ message: 'Audio downloaded and saved successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }









    
});


app.get('/cpee_interface_download', async (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {

        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.download_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("download_callback:", callbacks.download_callback);
        callbacks.download_callback_is_set = true;

        var jsonData = {
            "download_foo": 1,
        };
        res.setHeader('CPEE-CALLBACK', 'true');
        res.send(jsonData)

    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});


app.listen(port_download, hostname, () => {
    console.info(`port_download: ${port_download}`);
    console.info(`redirection_path_download: ${redirection_path_download}`);
    console.info(`root_path: ${root_path}`);
    console.info(`download-server running at http://${hostname}:${port_download}/`);
});