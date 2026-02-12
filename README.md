# TurboRecap - YouTube Video Summarizer

Fast-track your insights with AI-powered YouTube video summaries.

## Features

- **Video Transcription**: Fetches transcripts from YouTube videos with timestamps
- **AI Summarization**: Uses OpenAI (GPT-3.5-turbo) to generate concise summaries
- **PDF Export**: Download summaries as formatted PDF documents
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- A web browser
- Backend API server running (see [jb-youtube-api](https://github.com/junalden/jb-youtube-api))
  - Backend handles all API calls: transcripts, video metadata, and AI summarization
  - No API keys needed in frontend!

### Configuration

1. Copy `JS/config.js.example` to `JS/config.js` (if not already present):

```bash
cp JS/config.js.example JS/config.js
```

2. Update backend URL in `JS/config.js`:

```javascript
const CONFIG = {
  BACKEND_API_URL: "your_backend_url_here"
};
```

### Backend Setup

The backend handles all API keys securely. You need to:

1. Deploy the [jb-youtube-api](https://github.com/junalden/jb-youtube-api) backend
2. Configure it with:
   - YouTube Data API key
   - OpenAI API key
   - (Optional) Proxy credentials
3. Use the deployed backend URL in your frontend config

See the [backend README](https://github.com/junalden/jb-youtube-api#readme) for setup instructions.

### Running Locally

Simply open `index.html` in a web browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server extension
# Right-click index.html -> Open with Live Server
```

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Generate Transcript" to fetch the transcript
3. View the transcript with timestamps
4. Click "Summarize" to generate an AI summary
5. Click "Download Summary as PDF" to save the summary

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Direct video ID: `VIDEO_ID`

## Project Structure

```
junalden-pp3/
├── index.html          # Main HTML page
├── CSS/
│   ├── style.css       # Main styles
│   └── utilities.css   # Utility classes
├── JS/
│   ├── config.js       # API configuration
│   └── script.js       # Application logic
└── Images/             # Logo, favicon, GIFs
```

## Security Notes

✅ **Fully Secure**: Zero API keys in frontend code

✅ **All API keys** are now secured on the backend server:
- YouTube Data API key
- OpenAI API key

✅ **Best Practice**: All sensitive API calls go through your backend

## Architecture

```
Frontend (Browser)
  ↓
  All requests go to Backend Server
  ↓
Backend Server
  ├─→ YouTube Data API (video metadata)
  ├─→ YouTube Transcript API (captions)
  └─→ OpenAI API (AI summaries)
```

All API keys are stored as environment variables on the backend and never exposed to the client.

## Technologies Used

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- Backend API ([jb-youtube-api](https://github.com/junalden/jb-youtube-api))
  - YouTube Data API v3
  - YouTube Transcript API
  - OpenAI API
- jsPDF (for PDF generation)
- Font Awesome (icons)

## Credits

Created by Jun Alden Bondoc as part of KodeGo PP3 project.

## License

© 2024 Jun Alden Bondoc
