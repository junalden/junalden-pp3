// Set FLAG to only load summary
let summaryLoaded = false;
console.log(`Summary Loaded: ${summaryLoaded}`);

// Send YouTube video
document
  .querySelector("#video-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const youtubeLink = document.querySelector("#youtube-link").value;
    const videoId = youtubeLink.split("v=")[1]?.split("&")[0];
    const apiKey = "AIzaSyDlVpiIjSAadiIYC9zj7Lsv73UVu0M-2Lw"; //  YouTube Data API key

    if (videoId) {
      try {
        // Create and append the iframe
        const iframe = document.createElement("iframe");
        iframe.width = "330";
        iframe.height = "190";
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.frameBorder = "0";
        iframe.allowFullscreen = false;

        const videoContainer = document.querySelector("#video-container");
        videoContainer.innerHTML = "";
        videoContainer.appendChild(iframe);

        fetch("https://jb-youtube-api.onrender.com", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "video_id=" + encodeURIComponent(videoId),
        })
          .then((response) => response.json())
          .then((data) => {
            const transcriptDiv = document.querySelector("#transcript");
            if (data.error) {
              transcriptDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            } else {
              const transcriptHtml = data
                .map((line) => {
                  // Assuming `line.start` is in seconds
                  const formattedTimestamp = parseDuration(
                    parseFloat(line.start)
                  );
                  return `<p><span class="timestamp">${formattedTimestamp}</span> ${line.text}</p>`;
                })
                .join("");
              transcriptDiv.innerHTML = transcriptHtml;

              // Hide loader on data load
              document.querySelector(".loader").style.display = "none";

              // Enable summarize button
              document.querySelector("#summarize-btn").disabled = false;
            }
          })
          .catch((error) => {
            document.querySelector(
              "#transcript"
            ).innerHTML = `<p>An error occurred: ${error}</p>`;
          });

        // Fetch video details from YouTube Data API
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
        );
        const data = await response.json();
        const videoDetails = data.items[0];

        if (videoDetails) {
          const title = videoDetails.snippet.title;
          const author = videoDetails.snippet.channelTitle;
          const duration = parseDuration2(videoDetails.contentDetails.duration);
          const description = videoDetails.snippet.description;

          document.querySelector("#video-details").innerHTML = `
          <p class="video-title"><strong>${title}</strong><br></p>
          <p><strong>Author:</strong> ${author}<br></p>
          <p><strong>Duration:</strong> ${duration}</p>
          <p class="description"><strong>Description:</strong> ${description}</p>
        `;

          // Show the generated data section
          document.querySelector("#generated-data").style.display = "grid";

          // UI IX view to add 90px allowance from top, main view
          const targetElement = document.querySelector("#generated-data");
          if (targetElement) {
            const offset = 100;
            const targetPosition =
              targetElement.getBoundingClientRect().top +
              window.pageYOffset -
              offset;
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
          }
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

// Convert seconds to hh:mm:ss format

function parseDuration(seconds) {
  seconds = Math.floor(seconds);

  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${secs}`;
}

function parseDuration2(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  const seconds = parseInt(match[3], 10) || 0;

  return `${hours}h ${minutes}m ${seconds}s`;
}

// Transctipt button
document
  .querySelector("#transcript-btn")
  .addEventListener("click", function () {
    toggleMenu("transcript");
  });

//  summarize button
document.querySelector("#summarize-btn").addEventListener("click", function () {
  toggleMenu("summarize");
  document.querySelector("#summarize-btn").textContent = "Summary";
});

function toggleMenu(activeMenu) {
  const transcriptBtn = document.querySelector("#transcript-btn");
  const summarizeBtn = document.querySelector("#summarize-btn");

  if (activeMenu === "transcript") {
    transcriptBtn.classList.add("transcript-menu-active");
    summarizeBtn.classList.remove("transcript-menu-active");
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#transcript").style.display = "block";

    console.log(`Summary Loaded: ${summaryLoaded}`);
  } else if (activeMenu === "summarize") {
    summarizeBtn.classList.add("transcript-menu-active");
    transcriptBtn.classList.remove("transcript-menu-active");
    document.querySelector("#transcript").style.display = "none";
    document.querySelector("#summary").style.display = "block";

    if (!summaryLoaded) {
      document.querySelector(".loader-summary").style.display = "flex";
      loadSummary();
      summaryLoaded = true;
      updateButtonVisibility();
    }
    console.log(`Summary Loaded: ${summaryLoaded}`);
  }
}

async function loadSummary() {
  const transcriptContainer = document.querySelector("#transcript");
  const summaryContainer = document.querySelector("#summary");

  const transcriptText = Array.from(transcriptContainer.querySelectorAll("p"))
    .map((p) => p.textContent)
    .join(" ");

  if (transcriptText.trim().length === 0) {
    summaryContainer.innerHTML = "<p>No transcript available to summarize.</p>";
    return;
  }

  const summary = await generateAIResponse(transcriptText);
  document.querySelector(".loader-summary").style.display = "none";
  summaryContainer.innerHTML = formatSummary(summary);
}

async function generateAIResponse(text) {
  const apiKey = "AIzaSyATdOo-sWAQqVPmdaf8nHZvUhmn8Sc3aGw"; //  Gemini API key
  const apiEndpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

  try {
    const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: text,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (data && data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (
        candidate &&
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        return candidate.content.parts[0].text.trim();
      }
    }
    return "No response from the AI.";
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred while processing your request.";
  }
}

function formatSummary(summary) {
  let formattedSummary = summary
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<p>${formattedSummary}</p>`;
}

// PDF generation using jsPDF
document
  .querySelector("#download-pdf-btn")
  .addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: "a4" });

    const maxWidth = 190;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10;

    const summaryContent = document.querySelector("#summary").innerHTML;
    const tempElement = document.createElement("div");
    tempElement.innerHTML = summaryContent;

    const paragraphs = tempElement.querySelectorAll("p");

    paragraphs.forEach((paragraph) => {
      const text = paragraph.textContent || paragraph.innerText || "";

      if (paragraph.querySelector("strong")) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      const lines = doc.splitTextToSize(text, maxWidth);

      if (y + lines.length * lineHeight > pageHeight - 10) {
        doc.addPage();
        y = 10;
      }

      doc.text(lines, 10, y);
      y += lines.length * lineHeight;
    });

    doc.save("summary.pdf");
  });

// GIF scroll effect
window.addEventListener("scroll", function () {
  const gifContainer = document.querySelector(".gif-container");
  const noteContainer = document.querySelector(".note-container");

  const windowTop = window.scrollY;
  const leftSpeed = 0.6;
  const translateXLeft = windowTop / leftSpeed;
  gifContainer.style.transform = `translateX(-${translateXLeft}px)`;

  const maxOpacityLeft = 0.3;
  const opacityLeft = Math.max(maxOpacityLeft, 1 - translateXLeft / 500);
  gifContainer.style.opacity = opacityLeft;

  const rightSpeed = 0.6;
  const translateXRight = windowTop / rightSpeed;
  noteContainer.style.transform = `translateX(${translateXRight}px)`;
  const maxOpacityRight = 0.3;
  const opacityRight = Math.max(maxOpacityRight, 1 - translateXRight / 500);
  noteContainer.style.opacity = opacityRight;
});

// Function to update button visibility
function updateButtonVisibility() {
  const summarizeBtn = document.querySelector("#summarize-btn");
  const pdfButton = document.querySelector("#download-pdf-btn");
  if (summaryLoaded) {
    summarizeBtn.style.display = "block";
    pdfButton.style.display = "block";
  } else {
    summarizeBtn.style.display = "block";
    pdfButton.style.display = "none";
  }
}

updateButtonVisibility();

// Function to handle scroll class
function handleScroll() {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleScroll);
handleScroll();
