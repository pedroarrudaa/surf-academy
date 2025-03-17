# Video Transcription Script

This utility script transcribes video files using OpenAI's Whisper API and generates summaries and chapters using GPT-4.

## Features

- Processes videos directly in memory without saving temporary audio files
- Generates accurate transcriptions using Whisper AI
- Creates concise summaries of video content with GPT-4
- Automatically divides content into logical chapters with timestamps
- Handles various video formats supported by ffmpeg

## Prerequisites

- Node.js 16+ and npm
- ffmpeg installed on your system
- OpenAI API key with access to Whisper and GPT-4

## Installation

1. Ensure you have ffmpeg installed:
   ```
   # On macOS with Homebrew
   brew install ffmpeg
   
   # On Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # On Windows with Chocolatey
   choco install ffmpeg
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Set your OpenAI API key:
   ```
   # Linux/macOS
   export OPENAI_API_KEY=your-api-key
   
   # Windows Command Prompt
   set OPENAI_API_KEY=your-api-key
   
   # Windows PowerShell
   $env:OPENAI_API_KEY="your-api-key"
   ```

## Usage

Run the script with a path to your video file:

```
npm run transcribe /path/to/your/video.mp4
```

Or directly with ts-node:

```
ts-node transcribeVideo.ts /path/to/your/video.mp4
```

### Output

The script will:
1. Extract audio from the video
2. Transcribe the audio using Whisper AI
3. Generate a summary using GPT-4
4. Create logical chapters with timestamps
5. Display a summary of results in the console
6. Save complete results to `transcript-result.json`

## Integration with Next.js App

To use this script in your Next.js application:

1. Import the `transcribeVideo` function:
   ```typescript
   import { transcribeVideo } from '../scripts/transcribeVideo';
   ```

2. Call the function with the video path:
   ```typescript
   const result = await transcribeVideo('/path/to/video.mp4');
   
   // Use the resulting transcript, chapters, and summary
   console.log(result.summary);
   console.log(result.chapters);
   ```

## Notes

- Processing large videos may take significant time
- The script will generate temporally consistent chapters based on the transcript
- The quality of transcription depends on the audio clarity of the video
- OpenAI API usage will incur charges according to your billing plan 