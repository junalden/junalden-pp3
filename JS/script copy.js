document
  .getElementById("video-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const youtubeLink = document.getElementById("youtube-link").value;
    const videoId = youtubeLink.split("v=")[1]?.split("&")[0];
    const apiKey = "AIzaSyDlVpiIjSAadiIYC9zj7Lsv73UVu0M-2Lw"; // Replace with your YouTube Data API key

    if (videoId) {
      try {
        // Create and append the iframe
        const iframe = document.createElement("iframe");
        iframe.width = "330";
        iframe.height = "190";
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameBorder = "0";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = false; // Allow fullscreen mode

        const videoContainer = document.getElementById("video-container");
        videoContainer.innerHTML = "";
        videoContainer.appendChild(iframe);

        fetch("https://jb-youtube-api.onrender.com", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "video_id=" + encodeURIComponent(videoId),
        })
          .then((response) => response.json())
          .then((data) => {
            const transcriptDiv = document.getElementById("transcript");
            if (data.error) {
              transcriptDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            } else {
              const transcriptHtml = data

                .map((line) => {
                  const formattedTime = formatTimestamp(line.start);
                  `<p><span class="timestamp">${formattedTime}</span> ${line.text}</p>`;
                })
                .join("");
              transcriptDiv.innerHTML = transcriptHtml;
            }
          })
          .catch((error) => {
            document.getElementById(
              "transcript"
            ).innerHTML = `<p>An error occurred: ${error}</p>`;
          });

        // Fetch video details from YouTube Data API
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
        );
        const data = await response.json();
        const videoDetails = data.items[0];

        // Extract and display video details
        if (videoDetails) {
          const title = videoDetails.snippet.title;
          const author = videoDetails.snippet.channelTitle;
          const duration = parseDuration(videoDetails.contentDetails.duration);
          const description = videoDetails.snippet.description;

          document.getElementById("video-details").innerHTML = `
                       <p class = "video-title"><strong>${title}</strong>  <br></p>
                       <p><strong>Author:</strong> ${author} <br></p>
                       <p><strong>Duration:</strong> ${duration}</p>
                       <p class="description"><strong>Description:</strong> ${description}</p>

                `;

          // Show the generated data section
          document.getElementById("generated-data").style.display = "grid";
        } else {
          alert("Unable to fetch video details");
        }
      } catch (error) {
        alert("An error occurred while fetching video details");
        console.error(error);
      }
    } else {
      alert("Invalid YouTube link");
    }
  });

// Helper function to convert ISO 8601 duration to human-readable format
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  const seconds = parseInt(match[3], 10) || 0;

  return `${hours}h ${minutes}m ${seconds}s`;
}

document
  .getElementById("transcript-btn")
  .addEventListener("click", function () {
    toggleMenu("transcript");
  });

document.getElementById("summarize-btn").addEventListener("click", function () {
  toggleMenu("summarize");
});

function toggleMenu(activeMenu) {
  const transcriptBtn = document.getElementById("transcript-btn");
  const summarizeBtn = document.getElementById("summarize-btn");

  if (activeMenu === "transcript") {
    transcriptBtn.classList.add("transcript-menu-active");
    summarizeBtn.classList.remove("transcript-menu-active");
    // Add logic to show transcript content
  } else if (activeMenu === "summarize") {
    summarizeBtn.classList.add("transcript-menu-active");
    transcriptBtn.classList.remove("transcript-menu-active");
    // Add logic to show summarize content
  }
}

function formatTimestamp(seconds) {
  if (seconds == null) return "No timestamp";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
