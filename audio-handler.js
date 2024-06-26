const fs = require('fs');
const path = require('path');
const port = process.env.port;

const { MongoClient } = require('mongodb');
const GridFSBucket = require('mongodb').GridFSBucket;
const uri = process.env.mongodb_uri;
const dbName = process.env.db_name;

function handleAudio(audioBlob, fileName) {
    // Define a path to save the audio file
    const audioPath = path.join(__dirname, 'wavs', fileName);

    // Ensure the 'puts' directory exists
    if (!fs.existsSync(path.join(__dirname, 'wavs'))) {
        fs.mkdirSync(path.join(__dirname, 'wavs'));
    }

    // Write the audio blob to a file
    fs.writeFile(audioPath, audioBlob, (err) => {
        if (err) {
            console.error('Error saving the audio file:', err);
            throw err;
        }

        console.log('Audio file saved:', audioPath);
    });
}


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


async function handleAudioDB(audioBlob, fileName) {
    const client = await connectToDatabase();
    if (!client) {
        console.error('Failed to connect to MongoDB. Aborting file download.');
        return false;
    }
    try {
        const db = client.db(dbName);
        
        const bucket = new GridFSBucket(db);
        const readableStream = require('stream').Readable.from(audioBlob);

        // Create an put stream and put the audio data to GridFS
        const putStream = bucket.openUploadStream(fileName);
        await new Promise((resolve, reject) => {
            readableStream.pipe(putStream)
                .on('error', reject)
                .on('finish', resolve);
        });

        console.log('Audio file stored in GridFS with file ID:', putStream.id);

	return putStream.id; 
    } catch (error) {
        console.error('Error storing audio file in GridFS:', error);
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}

module.exports.handleAudio = handleAudio;
module.exports.handleAudioDB = handleAudioDB;
