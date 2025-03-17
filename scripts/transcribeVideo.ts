import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface for transcription result
 */
interface TranscriptionResult {
  transcript: string;
  chapters: Chapter[];
  summary: string;
}

/**
 * Interface for chapter data
 */
interface Chapter {
  id: string;
  title: string;
  startTime: string;
  content: string;
}

/**
 * Extracts audio from video file directly to memory without saving to disk
 * @param videoPath Path to the video file
 * @returns Promise resolving to audio buffer
 */
async function extractAudioBuffer(videoPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Validate input file
    if (!fs.existsSync(videoPath)) {
      reject(new Error(`Video file not found: ${videoPath}`));
      return;
    }

    console.log(`Extracting audio from: ${videoPath}`);
    
    // Use ffmpeg to extract audio directly to stdout as MP3
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,            // Input file
      '-vn',                      // Disable video
      '-acodec', 'libmp3lame',    // MP3 codec
      '-ar', '44100',             // Sample rate
      '-ac', '2',                 // Stereo
      '-b:a', '192k',             // Bitrate
      '-f', 'mp3',                // Format
      '-'                         // Output to stdout
    ]);

    // Collect audio data chunks
    const chunks: Buffer[] = [];
    
    ffmpeg.stdout.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`ffmpeg info: ${data.toString()}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const audioBuffer = Buffer.concat(chunks);
        console.log(`Audio extraction complete: ${audioBuffer.length} bytes`);
        resolve(audioBuffer);
      } else {
        reject(new Error(`ffmpeg process exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to spawn ffmpeg process: ${err.message}`));
    });
  });
}

/**
 * Transcribes audio using OpenAI's Whisper API
 * @param audioBuffer Audio data buffer
 * @returns Promise resolving to transcription text
 */
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  console.log(`Transcribing ${audioBuffer.length} bytes of audio with Whisper API`);
  
  try {
    // Create a readable stream from the buffer to pass to the OpenAI API
    const audioStream = new Readable();
    audioStream.push(audioBuffer);
    audioStream.push(null);
    
    // Create a virtual file for the OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
      model: "whisper-1",
      language: "en",
      response_format: "text",
      temperature: 0.2
    });
    
    console.log(`Transcription complete: ${transcription.length} characters`);
    return transcription;
  } catch (error) {
    console.error('Error during transcription:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates a summary of the transcription using GPT-4
 * @param transcript The full transcription text
 * @returns Promise resolving to a summary
 */
async function generateSummary(transcript: string): Promise<string> {
  console.log('Generating summary using GPT-4');
  
  if (!transcript || transcript.length === 0) {
    return "No transcript available to summarize.";
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes video transcripts concisely and accurately."
        },
        {
          role: "user",
          content: `Please summarize the following transcript in a concise paragraph (maximum 150 words):\n\n${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: 250
    });
    
    const summary = completion.choices[0]?.message?.content || "Failed to generate summary.";
    console.log(`Summary generated: ${summary.length} characters`);
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Failed to generate summary: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * Generates chapters from the transcription
 * @param transcript The full transcription text
 * @param videoDuration Optional video duration in seconds for better timestamp estimation
 * @returns Array of chapters with timestamps
 */
async function generateChapters(transcript: string, videoDuration?: number): Promise<Chapter[]> {
  console.log('Generating chapters from transcript');
  
  if (!transcript || transcript.length === 0) {
    return [];
  }
  
  try {
    // Use GPT-4 to identify logical chapter breaks and titles
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes video transcripts and creates logical chapters with timestamps."
        },
        {
          role: "user",
          content: `Analyze this transcript and divide it into 3-7 logical chapters. For each chapter, provide a short title and estimate the timestamp (MM:SS format) where it starts. The total video duration is ${videoDuration ? Math.floor(videoDuration / 60) + ':' + (videoDuration % 60).toString().padStart(2, '0') : 'unknown'}.\n\nFormat your response as JSON in this exact structure: [{"title": "Chapter Title", "startTime": "MM:SS", "content": "First few sentences of this chapter..."}]\n\nTranscript:\n${transcript}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const responseContent = completion.choices[0]?.message?.content || "[]";
    const parsedResponse = JSON.parse(responseContent);
    
    if (!parsedResponse.chapters || !Array.isArray(parsedResponse.chapters)) {
      throw new Error("Invalid chapter format returned from AI");
    }
    
    // Format and validate chapters
    const chapters: Chapter[] = parsedResponse.chapters.map((chapter: any, index: number) => {
      // Validate timestamp format
      let startTime = chapter.startTime || "0:00";
      if (!/^\d+:\d{2}$/.test(startTime)) {
        startTime = `${index}:00`; // Fallback
      }
      
      return {
        id: `chapter-${index + 1}`,
        title: chapter.title || `Chapter ${index + 1}`,
        startTime,
        content: chapter.content || ""
      };
    });
    
    // Sort chapters by timestamp
    chapters.sort((a, b) => {
      const [aMin, aSec] = a.startTime.split(':').map(Number);
      const [bMin, bSec] = b.startTime.split(':').map(Number);
      
      const aSeconds = aMin * 60 + aSec;
      const bSeconds = bMin * 60 + bSec;
      
      return aSeconds - bSeconds;
    });
    
    console.log(`Generated ${chapters.length} chapters`);
    return chapters;
  } catch (error) {
    console.error('Error generating chapters:', error);
    
    // Fallback: Generate basic chapters based on transcript length
    return generateBasicChapters(transcript, videoDuration);
  }
}

/**
 * Fallback function to generate basic chapters when AI chapter generation fails
 * @param transcript The full transcription text
 * @param videoDuration Optional video duration in seconds
 * @returns Array of basic chapters
 */
function generateBasicChapters(transcript: string, videoDuration?: number): Chapter[] {
  console.log('Falling back to basic chapter generation');
  
  // Determine a reasonable number of chapters based on transcript length
  const wordCount = transcript.split(/\s+/).length;
  const estimatedDuration = videoDuration || Math.max(60, Math.round(wordCount / 150 * 60));
  const numChapters = Math.max(3, Math.min(7, Math.ceil(estimatedDuration / 120)));
  
  // Split transcript into roughly equal segments
  const chapterLength = Math.ceil(transcript.length / numChapters);
  const chapters: Chapter[] = [];
  
  for (let i = 0; i < numChapters; i++) {
    const startPos = i * chapterLength;
    const endPos = Math.min(startPos + chapterLength, transcript.length);
    
    // Skip if we've reached the end
    if (startPos >= transcript.length) break;
    
    // Extract content and find a good breaking point
    let content = transcript.substring(startPos, endPos);
    
    // Estimate timestamp
    const timePercent = i / numChapters;
    const timeSeconds = Math.floor(timePercent * estimatedDuration);
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;
    const startTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Generate a simple title from first few words
    const firstWords = content.split(/\s+/).slice(0, 5).join(' ');
    const title = firstWords ? `${firstWords}...` : `Chapter ${i + 1}`;
    
    chapters.push({
      id: `auto-${i + 1}`,
      title,
      startTime,
      content: content.substring(0, 500) // Limit content length
    });
  }
  
  return chapters;
}

/**
 * Gets the duration of a video file in seconds
 * @param videoPath Path to video file
 * @returns Promise resolving to duration in seconds
 */
async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ]);
    
    let output = '';
    
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        console.log(`Video duration: ${duration} seconds`);
        resolve(duration);
      } else {
        console.warn(`Could not get video duration, using estimate instead`);
        resolve(0); // Return 0 to trigger estimation later
      }
    });
    
    ffprobe.on('error', (err) => {
      console.warn(`ffprobe error: ${err.message}`);
      resolve(0); // Return 0 to trigger estimation later
    });
  });
}

/**
 * Main function that transcribes a video file
 * @param videoPath Path to video file
 * @returns Promise resolving to transcription result
 */
export async function transcribeVideo(videoPath: string): Promise<TranscriptionResult> {
  try {
    console.log(`Starting video transcription process for: ${videoPath}`);
    
    // Get video duration for better chapter timestamps
    const duration = await getVideoDuration(videoPath);
    
    // Extract audio from video
    const audioBuffer = await extractAudioBuffer(videoPath);
    
    // Transcribe audio
    const transcript = await transcribeAudio(audioBuffer);
    
    // Generate summary
    const summary = await generateSummary(transcript);
    
    // Generate chapters
    const chapters = await generateChapters(transcript, duration);
    
    return {
      transcript,
      chapters,
      summary
    };
  } catch (error) {
    console.error('Error in transcription process:', error);
    throw error;
  }
}

/**
 * CLI entry point when script is run directly
 */
async function main() {
  // Check if video path is provided as argument
  const videoPath = process.argv[2];
  
  if (!videoPath) {
    console.error('Please provide a path to a video file');
    process.exit(1);
  }
  
  try {
    const result = await transcribeVideo(videoPath);
    
    console.log('\n===== TRANSCRIPTION RESULT =====\n');
    console.log(`Summary: ${result.summary}\n`);
    
    console.log('Chapters:');
    result.chapters.forEach(chapter => {
      console.log(`[${chapter.startTime}] ${chapter.title}`);
    });
    
    // Save result to JSON file
    const outputPath = path.join(process.cwd(), 'transcript-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nFull result saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Transcription failed:', error);
    process.exit(1);
  }
}

// Run main function if script is executed directly
if (require.main === module) {
  main();
} 