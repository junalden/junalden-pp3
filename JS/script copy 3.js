//   set FLAG to only load summary
let summaryLoaded = false;
console.log(`Summary Loaded: ${summaryLoaded}`);

document
  .querySelector("#video-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const youtubeLink = document.querySelector("#youtube-link").value;
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
        iframe.allowFullscreen = false; // Allow fullscreen mode

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
                .map(
                  (line) =>
                    `<p><span class="timestamp">${line.start}</span> ${line.text}</p>`
                )
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

        // Extract and display video details
        if (videoDetails) {
          const title = videoDetails.snippet.title;
          const author = videoDetails.snippet.channelTitle;
          const duration = parseDuration(videoDetails.contentDetails.duration);
          const description = videoDetails.snippet.description;

          document.querySelector("#video-details").innerHTML = `
              <p class="video-title"><strong>${title}</strong><br></p>
              <p><strong>Author:</strong> ${author}<br></p>
              <p><strong>Duration:</strong> ${duration}</p>
              <p class="description"><strong>Description:</strong> ${description}</p>
            `;

          // Show the generated data section
          document.querySelector("#generated-data").style.display = "grid";

          // Scroll to the generated-data section
          const targetElement = document.querySelector(".generated-data");
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
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

  //show summary loader

  document.getElementById("summarize-btn").textContent = "Summary";
  //   https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_node_textcontent_set
});

function toggleMenu(activeMenu) {
  const transcriptBtn = document.getElementById("transcript-btn");
  const summarizeBtn = document.getElementById("summarize-btn");

  if (activeMenu === "transcript") {
    transcriptBtn.classList.add("transcript-menu-active");
    summarizeBtn.classList.remove("transcript-menu-active");
    document.getElementById("summary").style.display = "none";
    document.getElementById("transcript").style.display = "block";

    console.log(`Summary Loaded: ${summaryLoaded}`);
    // transcript content
  } else if (activeMenu === "summarize") {
    summarizeBtn.classList.add("transcript-menu-active");
    transcriptBtn.classList.remove("transcript-menu-active");
    document.getElementById("transcript").style.display = "none";
    document.getElementById("summary").style.display = "block";

    if (!summaryLoaded) {
      document.querySelector(".loader-summary").style.display = "flex";
      loadSummary();
      summaryLoaded = true;
      updateButtonVisibility(); // Set flag to true after loading summary
      // summarizeBtn.textContent = "Summary"; // Change button text
    }
    console.log(`Summary Loaded: ${summaryLoaded}`);
    //  summarize content
  }
}

async function loadSummary() {
  const transcriptContainer = document.getElementById("transcript");
  const summaryContainer = document.getElementById("summary");

  // Get transcript text
  const transcriptText = Array.from(transcriptContainer.querySelectorAll("p"))
    .map((p) => p.textContent)
    .join(" ");

  if (transcriptText.trim().length === 0) {
    summaryContainer.innerHTML = "<p>No transcript available to summarize.</p>";
    return;
  }

  // Generate summary from transcript
  const summary = await generateAIResponse(transcriptText);

  //hide summary loader
  document.querySelector(".loader-summary").style.display = "none";

  summaryContainer.innerHTML = formatSummary(summary);
}

async function generateAIResponse(text) {
  const apiKey = "AIzaSyATdOo-sWAQqVPmdaf8nHZvUhmn8Sc3aGw"; // Replace with your Gemini API key
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
    console.log("API Response:", data); // Log the entire response for debugging

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
  // Simple formatting: replace newlines with <br> and add <p> tags
  let formattedSummary = summary
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
    .replace(/\n\n/g, "</p><p>") // Paragraph breaks
    .replace(/\n/g, "<br>"); // Line breaks

  return `<p>${formattedSummary}</p>`;
}

//PDF
//https://www.geeksforgeeks.org/how-to-generate-pdf-file-using-jspdf-library/
document
  .querySelector("#download-pdf-btn")
  .addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      format: "a4",
    });

    // Set max width for text wrapping (190mm for A4)
    const maxWidth = 190;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10; // Start position for text

    // Fetch the summary content
    const summaryContent = document.querySelector("#summary").innerHTML;

    // Use a temporary element to extract and format the summary
    const tempElement = document.createElement("div");
    tempElement.innerHTML = summaryContent;

    const paragraphs = tempElement.querySelectorAll("p");

    paragraphs.forEach((paragraph) => {
      const text = paragraph.textContent || paragraph.innerText || "";

      // Apply bold font if the paragraph contains <strong> tags
      if (paragraph.querySelector("strong")) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      // Split text into lines that fit within the maxWidth
      const lines = doc.splitTextToSize(text, maxWidth);

      // Check if adding this text will overflow the current page
      if (y + lines.length * lineHeight > pageHeight - 10) {
        doc.addPage(); // Add new page if overflow occurs
        y = 10; // Reset y position for new page
      }

      // Add text to PDF and move y position down by lineHeight for each line
      doc.text(lines, 10, y);
      y += lines.length * lineHeight;
    });

    // Save the PDF
    doc.save("summary.pdf");
  });

//-------------GIF SCROLL---------------------
window.addEventListener("scroll", function () {
  const gifContainer = document.querySelector(".gif-container");
  const noteContainer = document.querySelector(".note-container");

  // Left image movement
  const windowTop = window.scrollY;
  const leftSpeed = 0.6; // speed
  const translateXLeft = windowTop / leftSpeed;
  gifContainer.style.transform = `translateX(-${translateXLeft}px)`;

  const maxOpacityLeft = 0.3; // Minimum opacity
  const opacityLeft = Math.max(maxOpacityLeft, 1 - translateXLeft / 500); // Adjust divisor for fading speed
  gifContainer.style.opacity = opacityLeft;

  // Right image movement
  const rightSpeed = 0.6; // speed
  const translateXRight = windowTop / rightSpeed;
  noteContainer.style.transform = `translateX(${translateXRight}px)`;
  const maxOpacityRight = 0.3; // Minimum opacity
  const opacityRight = Math.max(maxOpacityRight, 1 - translateXRight / 500);
  noteContainer.style.opacity = opacityRight;
});

// Function to update button visibility
function updateButtonVisibility() {
  const button = document.querySelector("#download-pdf-btn");
  if (summaryLoaded) {
    button.style.display = "inline"; // Show button
  } else {
    button.style.display = "none"; // Hide button
  }
}

updateButtonVisibility();

// Function to add or remove the 'scrolled' class based on scroll position
function handleScroll() {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    // Adjust the scroll position as needed
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

// Add scroll event listener to handle scroll
window.addEventListener("scroll", handleScroll);

// Call the function initially in case the user has scrolled down already
handleScroll();
