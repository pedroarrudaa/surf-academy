# SurfAcademy

A modern platform for WindSurf IDE tutorials and blogs, featuring resources to help developers get the most out of this powerful code editor.

## Features

- Browse WindSurf IDE tutorial videos
- Read blog posts about WindSurf IDE and Codium AI integration
- Responsive design that works on mobile and desktop
- Comprehensive information about IDE features and extensions

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pedroarrudaa/surf-academy.git
cd surf_academy
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## About WindSurf IDE

WindSurf IDE is a modern code editor designed for developers who want to streamline their workflow and boost productivity. Key features include:

- Powerful integrated debugger
- Git integration for version control
- Extension marketplace
- Remote development capabilities
- Advanced customization options
- Codium AI integration for intelligent coding assistance

## Technologies Used

- Next.js and React
- TypeScript
- Tailwind CSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Video Transcription and Analysis Enhancements

### Overview

We've implemented a robust video processing system using AssemblyAI's API to transcribe and analyze YouTube video content. This system enables automatic extraction of chapters, summaries, and detailed content from videos.

### Key Features

#### 1. Optimized Audio Processing
- Efficient audio extraction from YouTube videos
- Automatic conversion to mono 16kHz format (optimal for transcription)
- Reduced audio quality to 128kbps (sufficient for speech recognition)
- File-based caching to avoid redundant downloads

#### 2. High-Speed Transcription with AssemblyAI
- Utilizes AssemblyAI's "nano" speech model (5-10x faster than standard)
- Automatic chapter generation and summarization
- Parallel processing for long audio files
- Dynamic polling strategy with exponential backoff

#### 3. Intelligent Chapter Generation
- Auto-identification of chapter boundaries based on content
- Start time extraction and formatting
- Content validation and filtering
- Automatic fallback if AssemblyAI chapters are unavailable

#### 4. Enhanced Video Modal Component
- Automatic detection of video duration via YouTube API
- Real-time interface states for user feedback
- Support for on-demand transcription
- Clean navigation between chapters

#### 5. Robust Error Handling
- Detection and recovery from failures at each processing stage
- Visual feedback to users about processing status
- Retry options in case of failures
- Detailed logging for diagnostics

### Processing Flow

1. **Audio Extraction**: The system downloads the YouTube video audio at optimal quality.
2. **Audio Analysis**: For long content (>15 minutes), audio is automatically split into segments.
3. **Parallel Processing**: Segments are processed concurrently for dramatically faster results.
4. **Transcription**: Audio is sent to AssemblyAI for fast transcription.
5. **Enhancement**: If configured, OpenAI enhances the chapters and summary.
6. **Presentation**: Validated chapters are displayed in the interface for easy navigation.

### Performance Improvements

- **Short audios** (<1 minute): Complete in 5-15 seconds
- **Medium audios** (1-5 minutes): Complete in 15-45 seconds
- **Long content** (>15 minutes): Dramatically improved through parallel processing

### Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Audio Processing**: FFmpeg, yt-dlp
- **AI**: AssemblyAI API, OpenAI API (optional enhancement)
- **Video Integration**: YouTube iFrame API

This implementation solves common issues like slow processing times, incorrect timestamps, and audio processing failures, ensuring a reliable and high-quality experience for users.
