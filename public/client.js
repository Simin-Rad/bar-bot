function runPythonScript() {
  console.log( 'started AJAX' );    

  // Make an AJAX request to your Python script on the server.
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/run_python_script', true);

  xhr.onload = function () {
      if (xhr.status === 200) {
          console.log('success');
      } else {
          console.error('Error');
      }
  };

  xhr.send();
}

function clearElement(elementID)
{
  document.getElementById(elementID).innerHTML = "Speak out your order and click on Stop once you're finished!";
  //document.getElementById(elementID).innerHTML = "Please wait while AI interprets your order ...";
}

function clearWaitElement(elementID)
{
  document.getElementById(elementID).innerHTML = "Please wait while AI interprets your order ...";
}

function runScriptAndLoadHTMLIntoElement(url, elementId) {
  fetch(url)
      .then(response => response.text())
      .then(html => {
          // Insert the loaded HTML into the specified element
          document.getElementById(elementId).innerHTML = html;
      })
      .catch(error => {
          console.error('Error:', error);
      });
}

async function uploadAudioToServer(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'recordedAudio.wav'); // You can specify a filename if needed

  const response = await fetch(`${env.redirection_path}/upload`, {
      method: 'POST',
      body: formData
  });

  if (response.ok) {
      console.log("Uploaded successfully!");
  } else {
      console.error("Upload failed:", await response.text());
  }
}

async function client() {
  try {
    const buttonStart = document.querySelector('#buttonStart')
    const buttonStop = document.querySelector('#buttonStop')
    const audio = document.querySelector('#audio')

    const stream = await navigator.mediaDevices.getUserMedia({ // <1>
      vide: false,
      audio: true,
    })

    const [track] = stream.getAudioTracks()
    const settings = track.getSettings() // <2>

    const audioContext = new AudioContext()
    await audioContext.audioWorklet.addModule('audio-recorder.js') // <3>

    const mediaStreamSource = audioContext.createMediaStreamSource(stream) // <4>
    const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder') // <5>
    const buffers = []

    audioRecorder.port.addEventListener('message', event => { // <6>
      buffers.push(event.data.buffer)
    })
    audioRecorder.port.start() // <7>

    mediaStreamSource.connect(audioRecorder) // <8>
    audioRecorder.connect(audioContext.destination)

    buttonStart.addEventListener('click', event => {

      clearElement('content-placeholder')

      buttonStart.setAttribute('disabled', 'disabled')
      buttonStop.removeAttribute('disabled')

      const parameter = audioRecorder.parameters.get('isRecording')
      parameter.setValueAtTime(1, audioContext.currentTime) // <9>

      buffers.splice(0, buffers.length)
    })

    buttonStop.addEventListener('click', async event => {
      console.log(env.redirection_path);
      clearWaitElement('content-placeholder')

      buttonStop.setAttribute('disabled', 'disabled')
      buttonStart.removeAttribute('disabled')

      const parameter = audioRecorder.parameters.get('isRecording')
      parameter.setValueAtTime(0, audioContext.currentTime) // <10>

      const blob = encodeAudio(buffers, settings) // <11>
      const url = URL.createObjectURL(blob)

      audio.src = url

      // Upload the audio blob to the server
      try {
        await uploadAudioToServer(blob);
      } catch (err) {
        console.error("Error uploading audio:", err);
      }

      runScriptAndLoadHTMLIntoElement(`${env.redirection_path}/run_python_script`, 'content-placeholder')

    })
  } catch (err) {
    console.error(err)
  }
}

client()