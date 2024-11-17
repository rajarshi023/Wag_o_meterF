
var selectedColor = "";

// Function to open the popup
function openPopup() {
    document.getElementById('popup').style.display = 'flex';
}

// Function to close the popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function startGame(){
    if(this.validateForm()){
        var currentDogData = {
            name: document.getElementById('username').value,
            time: document.getElementById('time').value,
            colorBand: this.selectedColor
        };
        sessionStorage.setItem("currentDogData", JSON.stringify(currentDogData));
        document.getElementById('username').value = "";
        document.getElementById('time').value = "";
        setTimeout(() => {
            window.location.href = "../main";
        }, 1000);
    }

}


  function validateForm() {
      const username = document.getElementById('username').value.trim();
      const time = document.getElementById('time').value;

      if (username === "" || time === "" || selectedColor === "") {
        alert("Please fill out all fields before submitting.");
        return false; // Prevent form submission
      }
      return true; // Allow form submission
    }


   function selectColor(color) {
      // Remove 'selected' class from all color options
      document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
      });

      // Add 'selected' class to the clicked color option
      document.querySelector(`.color-option.${color}`).classList.add('selected');
      this.selectedColor = color;
    }

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

