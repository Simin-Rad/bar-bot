const express = require('express');
const multer = require('multer');
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
    
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
