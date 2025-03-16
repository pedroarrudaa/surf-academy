import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract video ID from YouTube URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Helper function to download audio from YouTube
async function downloadYouTubeAudio(videoUrl: string): Promise<string> {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const tempDir = os.tmpdir();
  const outputPath = path.join(tempDir, `${videoId}.mp3`);

  return new Promise((resolve, reject) => {
    const audioStream = ytdl(videoUrl, { quality: 'lowestaudio' });
    const writeStream = fs.createWriteStream(outputPath);
    
    audioStream.pipe(writeStream);
    
    writeStream.on('finish', () => {
      resolve(outputPath);
    });
    
    writeStream.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to identify potential chapter boundaries
function generateChapters(transcription: string): { id: string; title: string; startTime: string; content: string; }[] {
  // Simple chapter detection based on paragraph breaks and timing hints
  const lines = transcription.split('\n').filter(line => line.trim() !== '');
  const chapters = [];
  
  let currentChapter = '';
  let currentTitle = '';
  let startTime = '00:00';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for timing markers like [00:15], (2:30), or "At 4 minutes 20 seconds"
    const timeMatch = line.match(/\[(\d+:\d+)\]|\((\d+:\d+)\)|(\d+:\d+)|(\d+) minutes? (\d+) seconds?/);
    
    // Look for potential titles (short sentences ending with period)
    const titleMatch = line.match(/^(.{10,60})\./);
    
    if ((timeMatch || (i > 0 && i % 5 === 0)) && currentChapter) {
      // Create a new chapter when we detect a time marker or every 5 lines
      chapters.push({
        id: `chapter-${chapters.length + 1}`,
        title: currentTitle || `Chapter ${chapters.length + 1}`,
        startTime: startTime,
        content: currentChapter.trim()
      });
      
      // Extract time for the next chapter
      if (timeMatch) {
        startTime = timeMatch[1] || timeMatch[2] || timeMatch[3] || 
                   `${timeMatch[4]}:${timeMatch[5].padStart(2, '0')}` || startTime;
      } else {
        // Estimate time based on transcript position
        const minutes = Math.floor(i / 15);
        startTime = `${minutes}:${((i % 15) * 4).toString().padStart(2, '0')}`;
      }
      
      // Reset for next chapter
      currentChapter = line;
      currentTitle = titleMatch ? titleMatch[1] : '';
    } else {
      // Add to current chapter
      if (i === 0) {
        // First line might be a good title
        if (titleMatch) {
          currentTitle = titleMatch[1];
        }
      }
      currentChapter += (currentChapter ? '\n' : '') + line;
    }
  }
  
  // Add the last chapter
  if (currentChapter) {
    chapters.push({
      id: `chapter-${chapters.length + 1}`,
      title: currentTitle || `Chapter ${chapters.length + 1}`,
      startTime: startTime,
      content: currentChapter.trim()
    });
  }
  
  return chapters;
}

// Main API handler function
export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }
    
    // 1. Download audio from YouTube
    const audioFilePath = await downloadYouTubeAudio(videoUrl);
    
    // 2. Transcribe using Whisper API
    const audioFile = fs.createReadStream(audioFilePath);
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text'
    });
    
    // 3. Generate chapters based on the transcription
    const chapters = generateChapters(response.text);
    
    // 4. Clean up the temporary file
    fs.unlinkSync(audioFilePath);
    
    // 5. Return the results
    return NextResponse.json({
      success: true,
      transcription: response.text,
      chapters: chapters
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
} 