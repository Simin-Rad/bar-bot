const fs = require('fs');
const path = require('path');

function handleAudio(audioBlob, originalName) {
    // Define a path to save the audio file
    const audioPath = path.join(__dirname, 'uploads', originalName);

    // Ensure the 'uploads' directory exists
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
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

module.exports = handleAudio;