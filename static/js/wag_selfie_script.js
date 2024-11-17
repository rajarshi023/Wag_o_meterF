 const captureButton = document.getElementById('captureButton');

        // Send request to capture photo when button is clicked
        captureButton.addEventListener('click', () => {
            fetch('/capture_photo', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    window.location.href = "../score";
                })
                .catch(error => {
                    messageElement.textContent = "Error capturing photo.";
                });
        });

           function startBackgroundAudio() {
  const audio = document.getElementById("background-audio");
   audio.volume = 0.3; // 30% volume

  // Try to play the audio
  audio.play().then(() => {
    console.log("Audio is playing");

    // Hide the button after the audio starts
    document.getElementById("start-audio-button").style.display = "none";
  }).catch(error => {
    console.error("Audio playback failed:", error);
    // Display an error or message if needed
  });
}

window.addEventListener("mouseover", () => {
  //startBackgroundAudio();
}, { once: false });
