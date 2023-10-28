const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 8000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No audio uploaded');
    }

    const audioBlob = req.file.buffer;
    // You can now save the audioBlob to a database, file system, etc.

    res.json({ message: 'Audio uploaded successfully' });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});