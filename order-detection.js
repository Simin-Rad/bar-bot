const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
require('dotenv').config();
const fs = require('fs');

const path = require('path');
const handleAudio = require('./audio-handler.js');

const app = express();
const hostname = "::";
const port_order_detection = process.env.port_order_detection;
const redirection_path_order_detection = process.env.redirection_path_order_detection
const redirection_path = process.env.redirection_path
const root_path = process.env.root_path
const api_key = process.env.api_key

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const axios = require('axios');

const callbacks = {
    run_callback: undefined,
    run_callback_is_set: false,
};

const ai_results = {
    results: undefined,
    ai_results_is_set: false,
};


app.get('/get_ai_results', async (req, res) => {
    while (!ai_results.ai_results_is_set) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Introduce a small delay
    }
    ai_results.ai_results_is_set = false;

    res.send(ai_results.results);
    ai_results.results = undefined;

});

function run_script_ai_order_detection(ordertext) {
    try {
        // Wait for the promise to be resolved before proceeding
        //await callbacks.run_callback_promise.promise;
        while (!callbacks.run_callback_is_set) {
            new Promise(resolve => setTimeout(resolve, 100)); // Introduce a small delay
        }
        callbacks.run_callback_is_set = false;

        console.log("ordertext", ordertext);

        exec(`python3 ${root_path}/ai_order_detection.py "${ordertext}"`, (error, stdout, stderr) => {
            if (error) {
                const payload = {
                    //success: 'false',
                    ai_results: stderr
                };
                ai_results.results = stderr
                ai_results.ai_results_is_set = true
                axios.put(callbacks.run_callback, payload)
                    .then(response => {
                        console.log('PUT request successful:', response.data);
                    })
                    .catch(error => {
                        console.error('Error making PUT request:', error.message);
                    });

                console.error(`Error executing script: ${stderr}`);
                return stderr;
            }
            console.log('script executed successfully');
            ai_results.results = stdout
            ai_results.ai_results_is_set = true
            console.log("ai_results.results", ai_results.results)
            const payload = JSON.parse(ai_results.results);
            //console.log("payload", payload)
            axios.put(callbacks.run_callback, payload)
                .then(response => {
                    console.log('PUT request successful:', response.data);
                })
                .catch(error => {
                    console.error('Error making PUT request:', error.message);
                });
            return payload;
        });
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

app.get('/cpee_interface_order_detection', async (req, res) => {
    try {
        //const audio_object_id = req.body.audio_object_id
        const ordertext = req.query.ordertext

        console.log("ordertext:", ordertext);
        // Access the headers from the req object
        const headers = req.headers;
        // Convert headers to a JSON string with indentation
        const formattedHeaders = JSON.stringify(headers, null, 2);
        // Print the headers to the console
        console.log("Headers:", formattedHeaders);

        callbacks.run_callback = req.headers['cpee-callback']; // only works from cpee
        console.log("run_callback:", callbacks.run_callback);
        callbacks.run_callback_is_set = true;

        const payload = run_script_ai_order_detection(ordertext)
        //console.log("payload:", payload);
        var jsonData = {
            "ai_foo": 1,
            "test": 3,
            "res": 4
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

app.listen(port_order_detection, hostname, () => {
    console.info(`port_order_detection: ${port_order_detection}`);
    console.info(`redirection_path_order_detection: ${redirection_path_order_detection}`);
    console.info(`root_path: ${root_path}`);
    console.info(`api_key: ${api_key}`);
    console.info(`ai-server running at http://${hostname}:${port_order_detection}/`);
});
