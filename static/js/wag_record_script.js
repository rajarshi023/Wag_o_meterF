        let dogData;
        let leaderBoard;
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');


        // Particle object
        function Particle(x, y, vx, vy, color, size) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;

            this.update = function() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.1; // Gravity
            }

            this.draw = function() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Array to store particles
        const particles = [];

        // Function to create explosion
        function explode(x, y) {
            for (let i = 0; i < 100; i++) {
                const particle = new Particle(
                    x,
                    y,
                    Math.random() * 10 - 5,
                    Math.random() * 10 - 5,
                    'hsl(' + Math.random() * 360 + ', 100%, 50%)',
                    Math.random() * 5 + 1
                );
                particles.push(particle);
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();

                // Remove particles that go off-screen
                if (particles[i].y > canvas.height) {
                    particles.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        // Trigger explosion on click
        canvas.addEventListener('mouseover', (event) => {
            explode(event.clientX, event.clientY);
        });

        (function() {
             dogData = JSON.parse(sessionStorage.getItem("currentDogScore"));
             leaderBoard = JSON.parse(sessionStorage.getItem("leaderboard"));
             document.getElementById("dogName").innerText = dogData.dogName;
             document.getElementById("score").innerText = dogData.score;
             animate();
        })();


    const leaderboardList = document.getElementById('leaderboard-list');
    const modal = document.getElementById('myModal');

    // Function to open the modal and show the leaderboard
    function showLeaderboard() {

      // Clear the current leaderboard list
      leaderboardList.innerHTML = '';

      // Display the updated leaderboard in a tabular format
      leaderBoard.sort((a, b) => b.score - a.score).slice(0,5).forEach((player, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${index + 1}</td>
          <td>${player.name}</td>
          <td>${player.score} points</td>
        `;
        leaderboardList.appendChild(tr);
      });

      // Show the modal
      modal.style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
      modal.style.display = 'none';
    }

    // Close the modal if the user clicks outside of it
    window.onclick = function(event) {
      if (event.target == modal) {
        closeModal();
      }
    }

   // Function for the Home button
    function goHome() {
      window.location.href = './';  // Change to your home page URL
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
  startBackgroundAudio();
}, { once: false });
