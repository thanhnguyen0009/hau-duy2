document.addEventListener("DOMContentLoaded", function () {
    const musicCircle = document.getElementById("musicCircle");
    const audio = document.getElementById("audio");

    // Load saved audio state from sessionStorage
    const isPlaying = sessionStorage.getItem("musicPlaying") === "true";
    const savedTime = parseFloat(sessionStorage.getItem("musicCurrentTime")) || 0;

    // Initialize audio state
    if (savedTime) {
        audio.currentTime = savedTime; // Restore playback position
    }

    if (isPlaying) {
        audio.play().then(() => {
            musicCircle.classList.add("spin"); // Resume spinning animation
        }).catch(error => {
            console.error("Audio playback failed:", error);
            // Display the "Click Me" label if playback fails
            document.querySelector(".lb-circle").style.display = "block";
        });
    } else {
        musicCircle.classList.remove("spin"); // Ensure no spinning if paused
    }

    // Toggle music playback on click
    musicCircle.addEventListener("click", toggleMusic);

    function toggleMusic() {
        if (audio.paused) {
            audio.play().then(() => {
                musicCircle.classList.add("spin");
                sessionStorage.setItem("musicPlaying", "true");
            }).catch(error => {
                console.error("Audio playback failed:", error);
            });
        } else {
            audio.pause();
            musicCircle.classList.remove("spin");
            sessionStorage.setItem("musicPlaying", "false");
        }
        // Save current playback time
        sessionStorage.setItem("musicCurrentTime", audio.currentTime);
    }

    // Save playback time periodically
    audio.addEventListener("timeupdate", () => {
        sessionStorage.setItem("musicCurrentTime", audio.currentTime);
    });

    // Update playback state on pause/play
    audio.addEventListener("play", () => {
        sessionStorage.setItem("musicPlaying", "true");
    });

    audio.addEventListener("pause", () => {
        sessionStorage.setItem("musicPlaying", "false");
    });

    // Handle YouTube video conflicts (if present)
    if (window.YT && window.YT.Player) {
        let player;
        function onYouTubeIframeAPIReady() {
            player = new window.YT.Player("video", {
                events: {
                    onStateChange: onPlayerStateChange,
                },
            });
        }

        function onPlayerStateChange(event) {
            if (event.data === window.YT.PlayerState.PLAYING) {
                if (!audio.paused) {
                    audio.pause();
                    musicCircle.classList.remove("spin");
                    sessionStorage.setItem("musicPlaying", "false");
                    sessionStorage.setItem("musicCurrentTime", audio.currentTime);
                }
            }
        }

        // Load YouTube API if not already loaded
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (document.getElementById("video")) {
            onYouTubeIframeAPIReady();
        }
    }
});