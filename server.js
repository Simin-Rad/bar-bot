const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const handleAudio = require('./audio-handler.js');

const app = express();
const port = 8000;
const hostname = "::";

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
        exec('python /Users/simin/dokumente/master/3.Semester/bar-bot/ai_backend.py', (error, stdout, stderr) => {
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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
