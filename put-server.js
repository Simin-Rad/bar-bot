const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
require('dotenv').config();

const path = require('path');
const { handleAudio, handleAudioDB } = require('./audio-handler.js');

const app = express();
const hostname = "::";
const port_put = process.env.port_put;
const redirection_path_put = process.env.redirection_path_put
const root_path = process.env.root_path
const api_key = process.env.api_key

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const storage = multer.memoryStorage();
const put = multer({ storage: storage });

const callbacks = {
    put_callback: undefined,
    put_callback_is_set: false,
};

function generateRandom16DigitNumber() {
    const min = 1000000000000000; // Minimum 16-digit number
    const max = 9999999999999999; // Maximum 16-digit number
  
    // Generate a random number within the specified range
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  
    return randomNumber.toString();
  }

app.post('/put', put.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio puted');
    }

    const audioBlob = req.file.buffer;
    const originalName = req.file.originalname
    const fileName = generateRandom16DigitNumber () + ".wav";

    try {
        // Log the headers (if needed)
        const headers = req.headers;
        const formattedHeaders = JSON.stringify(headers, null, 2);
        console.log("Headers:", formattedHeaders);

        // Wait for the signal (if needed)
        while (!callbacks.put_callback_is_set) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        callbacks.put_callback_is_set = false;

        // Handle the audio (e.g., save it)
        await handleAudio(audioBlob, fileName);
        //const obj_id = await handleAudioDB(audioBlob, req.file.originalname);

        // Send a callback request
        const payload = {
            fileName: fileName,
            url: "null"
        };
        axios.put(callbacks.put_callback, payload)
            .then(response => {
                console.log('PUT request successful:', response.data);
            })
            .catch(error => {
                console.error('Error making PUT request:', error.message);
            });
        // Respond for successful audio put

        res.json({ message: 'Audio puted and saved successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});


app.get('/cpee_interface_put', put.single('audio'), (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {

        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.put_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("put_callback:", callbacks.put_callback);
        callbacks.put_callback_is_set = true;

        var jsonData = {
            "put_foo": 1,
        };
        res.setHeader('CPEE-CALLBACK', 'true');
        res.send(jsonData)

    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});

app.listen(port_put, hostname, () => {
    console.info(`port_put: ${port_put}`);
    console.info(`redirection_path_put: ${redirection_path_put}`);
    console.info(`root_path: ${root_path}`);
    console.info(`api_key: ${api_key}`);
    console.info(`put-server running at http://${hostname}:${port_put}/`);
});
