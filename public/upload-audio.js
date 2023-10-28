async function uploadAudioToServer(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'recordedAudio.wav'); // You can specify a filename if needed

    const response = await fetch('/ports/8000/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        console.log("Uploaded successfully!");
    } else {
        console.error("Upload failed:", await response.text());
    }
}
