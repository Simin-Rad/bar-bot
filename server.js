const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
require('dotenv').config();

const path = require('path');
const handleAudio = require('./audio-handler.js');

const app = express();
const hostname = "::";
const port =  process.env.port;
const redirection_path = process.env.redirection_path
const root_path = process.env.root_path
const api_key = process.env.api_key

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio uploaded');
    }

    const audioBlob = req.file.buffer;

    try {
        handleAudio(audioBlob, req.file.originalname);
        res.json({ message: 'Audio uploaded and saved successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});
   
app.get('/run_python_script', (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {
        console.info(`input: ${req}`)
        // Replace '/path/to/your_script.py' with the actual path to your Python script.
        exec(`python3 ${root_path}/ai_backend.py`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${stderr}`);
                res.status(500).send(`Error executing Python script: ${stderr}`);
                return;
            }
            console.log('Python script executed successfully');
            res.send(stdout);
        });
    } catch (e) {
        console.error(`Error: ${e.message}`);
        res.status(500).send(`Error: ${e.message}`);
    }
});


app.get('/test', (req, res) => {
    // Run your Python script when the endpoint is accessed.
    try {


    var jsonData = {
        "foo": 1,
        "bar": 2
    };
    res.send (jsonData)
    } catch (e) {
	            console.error(`Error: ${e.message}`);
	            res.status(500).send(`Error: ${e.message}`);
    }
});




// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.info(`port: ${port}`);
    console.info(`redirection_path: ${redirection_path}`);
    console.info(`root_path: ${root_path}`);
    console.info(`api_key: ${api_key}`);
    console.info(`Server running at http://${hostname}:${port}/`);
});
