        let wagCount = 0;
        let timer = 2;
        let countdown;
        let isCapturing = false;
        let score = 0;
        const maxScore = 200000;
        let dogData;
        let lastWagCount = 0;

        function setColor(color) {
            fetch('/set_color', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `color=${color}`
            }).then(response => response.text())
              .then(data => console.log(data));
        }

        function setTimer(minutes) {
            timer = minutes;
            document.getElementById("countdown-overlay").innerText = `${minutes}:00`;
        }

        function startCapture() {
            if (isCapturing) return; // Prevent multiple captures at once
            isCapturing = true;
            fetch('/start_capture');
            wagCount = 0;
            //document.getElementById("progress-bar").style.width = "0%";
            startCountdown(timer * 60); // Start the countdown in seconds
           // updateProgressBar();
               score += 10;
            updateProgressBar();
            collectCoin();
        }

        function stopCapture() {
            if (!isCapturing) return;
            isCapturing = false;
            clearInterval(countdown);
            document.getElementById("countdown-overlay").innerText = "00:00";
            fetch('/stop_capture').then(() => {
                fetch('/get_wag_count')
                    .then(response => response.json())
                    .then(data => {
                        wagCount = data.wag_count;
                        document.getElementById("wag-count-display").innerText = "Wag Count: " + wagCount;
                        var currentDogScore = {
                            dogName: dogData.name,
                            score: wagCount * 1000
                        };
                        sessionStorage.setItem("currentDogScore", JSON.stringify(currentDogScore));
                        var leaderBoard = JSON.parse(sessionStorage.getItem("leaderboard"));
                        if(!leaderBoard)
                            leaderBoard = [];
                        leaderBoard.push({name : dogData.name, score: (wagCount * 1000)});
                        sessionStorage.setItem("leaderboard", JSON.stringify(leaderBoard));
                        window.location.href = "../selfie";
                    });
            });
        }

        function startCountdown(seconds) {
            const countdownOverlay = document.getElementById("countdown-overlay");
            countdown = setInterval(() => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                countdownOverlay.innerText = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

                if(seconds <= 10){
                    countdownOverlay.style.color = "red";
                }

                if (seconds <= 0) {
                    clearInterval(countdown);
                    stopCapture();
                }
                seconds--;
            }, 1000);
        }

        function updateProgressBar() {
            const interval = setInterval(() => {
                fetch('/get_wag_count')
                    .then(response => response.json())
                    .then(data => {
                        wagCount = data.wag_count;
                        document.getElementById("wag-count-display").innerText = "Wag Count: " + wagCount;
                        const scoreProgress = document.getElementById('scoreProgress');
                        const scoreText = document.getElementById('scoreText').innerText = "" + (wagCount * 1000);
                        const progressPercent = Math.min(((wagCount * 1000) / maxScore) * 100, 100);
                        scoreProgress.style.width = progressPercent + '%';
                        scoreText.textContent = `${wagCount * 1000}`;
                        if (!isCapturing || scoreProgress >= 100) {
                            clearInterval(interval);
                        }
                        if(wagCount > 1 && wagCount != lastWagCount)
                            gainPoint();
                        if(wagCount % 10 == 0 && wagCount != lastWagCount && wagCount != 0)
                            addStar();
                         lastWagCount = wagCount;
                    });
            }, 1000);
        }

        // Function to add a star icon to the score container with animation
        function addStar() {
            const star = document.createElement('img');
            star.src = 'https://img.icons8.com/emoji/48/000000/star-emoji.png'; // Star icon URL
            star.classList.add('star-icon');
            scoreContainer.appendChild(star);
        }

        (function() {
             dogData = JSON.parse(sessionStorage.getItem("currentDogData"));
             setColor(dogData.colorBand);
             setTimer(dogData.time);
             startCapture();
        })();

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
  startBackgroundAudio();
}, { once: false });

        function collectCoin() {
            const interval = setInterval(() => {
                fetch('/get_wag_count')
                    .then(response => response.json())
                    .then(data => {
                        wagCount = data.wag_count;
                        const scoreProgress = document.getElementById('coinProgress');
                        const scoreText = document.getElementById('coinText').innerText = "" + wagCount;
                        const progressPercent = (wagCount / 100) * 100;
                        scoreProgress.style.width = progressPercent + '%';
                        scoreText.textContent = `${wagCount * 1000}`;
                        if (!isCapturing || scoreProgress >= 100) {
                            clearInterval(interval);
                        }
                    });
            }, 1000);
        }

    let totalPoints = 0;

    function gainPoint() {
      totalPoints += 1;

      // Create the point element
      const point = document.createElement('div');
      point.classList.add('point');
      point.textContent = '+1';

      // Position the point randomly
      const container = document.getElementById('points-container');
      const xOffset = Math.random() * 100 - 70; // Random horizontal offset
      const yOffset = Math.random() * 100 - 70; // Random vertical offset
      point.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

      // Append to container
      container.appendChild(point);

      // Remove point after animation
      setTimeout(() => {
        point.remove();
      }, 1500);
    }