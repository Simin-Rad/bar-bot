const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
require('dotenv').config();

const path = require('path');
const handleAudio = require('./audio-handler.js');

const app = express();
const hostname = "::";
const port_ai = process.env.port_ai;
const redirection_path_ai = process.env.redirection_path_ai
const root_path = process.env.root_path
const api_key = process.env.api_key

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const callbacks = {
    run_callback: undefined,
    run_callback_is_set: false,
};

app.get('/run_python_script', async (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {
        console.info(`input: ${req}`)

        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        // Wait for the promise to be resolved before proceeding
        //await callbacks.run_callback_promise.promise;
        while (!callbacks.run_callback_is_set) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Introduce a small delay
        }
        callbacks.run_callback_is_set = false;

        // Replace '/path/to/your_script.py' with the actual path to your Python script.
        exec(`python3 ${root_path}/ai_backend.py`, (error, stdout, stderr) => {
            if (error) {
                const payload = {
                    success: 'false'
                };
                axios.put(callbacks.run_callback, payload)
                    .then(response => {
                        console.log('PUT request successful:', response.data);
                    })
                    .catch(error => {
                        console.error('Error making PUT request:', error.message);
                    });



                console.error(`Error executing Python script: ${stderr}`);
                res.status(500).send(`Error executing Python script: ${stderr}`);
                return;
            }
            console.log('Python script executed successfully');
            const payload = {
                success: 'true'
            };
            axios.put(callbacks.run_callback, payload)
                .then(response => {
                    console.log('PUT request successful:', response.data);
                })
                .catch(error => {
                    console.error('Error making PUT request:', error.message);
                });

            res.send(stdout);
        });
    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});


app.get('/cpee_interface_run_python_script', (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {

        console.log("audio_object_id:", req.query.audio_object_id);
        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.run_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("run_callback:", callbacks.run_callback);
        callbacks.run_callback_is_set = true;

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
//app.use(express.static(path.join(__dirname, 'public')));

app.listen(port_ai, hostname, () => {
    console.info(`port_ai: ${port_ai}`);
    console.info(`redirection_path_ai: ${redirection_path_ai}`);
    console.info(`root_path: ${root_path}`);
    console.info(`api_key: ${api_key}`);
    console.info(`ai-server running at http://${hostname}:${port_ai}/`);
});
