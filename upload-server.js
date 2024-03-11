const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
require('dotenv').config();

const path = require('path');
const handleAudio = require('./audio-handler.js');

const app = express();
const hostname = "::";
const port_upload = process.env.port_upload;
const redirection_path2 = process.env.redirection_path2
const root_path = process.env.root_path
const api_key = process.env.api_key

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const callbacks = {
    upload_callback: undefined,
    upload_callback_is_set: false,
};

app.post('/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio uploaded');
    }

    const audioBlob = req.file.buffer;

    try {
        // Log the headers (if needed)
        const headers = req.headers;
        const formattedHeaders = JSON.stringify(headers, null, 2);
        console.log("Headers:", formattedHeaders);

        // Wait for the signal (if needed)
        while (!callbacks.upload_callback_is_set) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        callbacks.upload_callback_is_set = false;

        // Handle the audio (e.g., save it)
        handleAudio(audioBlob, req.file.originalname);


        // Send a callback request
        const payload = {
            success: 'true'
        };
        axios.put(callbacks.upload_callback, payload)
            .then(response => {
                console.log('PUT request successful:', response.data);
            })
            .catch(error => {
                console.error('Error making PUT request:', error.message);
            });
        // Respond for successful audio upload

        res.json({ message: 'Audio uploaded and saved successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});


app.get('/cpee_interface_upload', upload.single('audio'), (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {

        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.upload_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("upload_callback:", callbacks.upload_callback);
        callbacks.upload_callback_is_set = true;

        var jsonData = {
            "foo": 1,
            "bar": 2
        };
        res.setHeader('CPEE-CALLBACK', 'true');
        res.send(jsonData)

    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port_upload, hostname, () => {
    console.info(`port: ${port_upload}`);
    console.info(`redirection_path: ${redirection_path2}`);
    console.info(`root_path: ${root_path}`);
    console.info(`api_key: ${api_key}`);
    console.info(`upload-server running at http://${hostname}:${port_upload}/`);
});