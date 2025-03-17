import { v4 as uuidv4 } from 'uuid';
import { VideoTranscription, Chapter } from "../types";
import { getCachedTranscription, cacheTranscription } from './cacheService';

/**
 * Interface representing the transcription result
 */
export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  chapters?: Chapter[];
  summary?: string;
  error?: string;
  sessionId?: string;  // Unique ID for tracking the transcription session with webhooks
  pollUrl?: string;    // URL to poll for transcription status updates
}

/**
 * Function to transcribe a video using the AssemblyAI through API endpoint
 * This is a client-safe function that calls the API endpoint
 * 
 * @param videoUrl URL of the video to transcribe
 * @returns Transcription result with full text and chapters
 */
export async function transcribeVideo(videoUrl: string): Promise<TranscriptionResult> {
  console.log(`transcribeVideo called with URL: ${videoUrl}`);
  
  try {
    // First, validate that this is a YouTube URL
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      console.error(`Invalid YouTube URL provided: ${videoUrl}`);
      return {
        success: false,
        error: 'Invalid YouTube URL. Only YouTube videos are currently supported.'
      };
    }

    console.log(`Extracted YouTube ID: ${videoId}, checking cache`);
    
    // Check if this video's transcription is already cached
    const cachedResult = getCachedTranscription(videoId);
    if (cachedResult) {
      console.log(`Cache hit for video ID: ${videoId}, returning cached result`);
      return cachedResult;
    }
    
    console.log(`Cache miss for video ID: ${videoId}, calling transcription API`);
    
    // Call the API to transcribe the video
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Transcription API error (${response.status}): ${errorText}`);
      
      return {
        success: false,
        error: `Failed to transcribe video: ${response.statusText}`
      };
    }

    // Parse the JSON response
    const data = await response.json();
    console.log('Transcription API response received:', {
      success: data.success,
      hasTranscription: Boolean(data.transcription),
      chaptersCount: data.chapters?.length || 0,
      hasSummary: Boolean(data.summary)
    });
    
    // Validate the response structure
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error in transcription API response'
      };
    }

    // Ensure we have the expected data
    if (!data.transcription) {
      console.error('No transcription in response from API');
      return {
        success: false,
        error: 'No transcription returned from API'
      };
    }

    // Create the result object
    const result = {
      success: true,
      transcription: data.transcription,
      chapters: data.chapters || [],
      summary: data.summary || ''
    };
    
    // Cache the successful result for future use
    cacheTranscription(videoId, result);
    
    // Return the complete result
    return result;
    
  } catch (error) {
    console.error('Error in transcribeVideo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during transcription'
    };
  }
}

/**
 * Splits a text into a specified number of chunks, trying to break at sentence boundaries
 * Client-safe utility function
 * 
 * @param text The text to split
 * @param numChunks Number of chunks to split into
 * @returns Array of text chunks
 */
export function splitTextIntoChunks(text: string, numChunks: number): string[] {
  if (!text || numChunks <= 0) {
    return [];
  }
  
  // If only one chunk requested, return the whole text
  if (numChunks === 1) {
    return [text];
  }
  
  // Find all sentence boundaries
  const sentenceBreaks: number[] = [];
  const sentenceRegex = /[.!?]\s+/g;
  let match;
  
  while ((match = sentenceRegex.exec(text)) !== null) {
    sentenceBreaks.push(match.index + match[0].length);
  }
  
  // If not enough sentence breaks, fall back to word boundaries
  if (sentenceBreaks.length < numChunks - 1) {
    const chunks: string[] = [];
    const chunkSize = Math.ceil(text.length / numChunks);
    
    // Try to break at word boundaries
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      if (start >= text.length) break;
      
      let end = Math.min(start + chunkSize, text.length);
      
      // If not at the end, try to find a word boundary
      if (end < text.length && end > start) {
        // Look for the next space after the ideal cut point
        const nextSpace = text.indexOf(' ', end);
        if (nextSpace > 0 && nextSpace - end < 20) { // Only adjust if space is nearby
          end = nextSpace;
        }
      }
      
      chunks.push(text.substring(start, end).trim());
    }
    
    return chunks;
  }
  
  // Ideal case: use sentence boundaries to split text
  const chunks: string[] = [];
  const idealChunkSize = text.length / numChunks;
  
  let chunkStart = 0;
  let currentChunk = 0;
  
  while (currentChunk < numChunks - 1 && sentenceBreaks.length > 0) {
    const idealPosition = chunkStart + idealChunkSize;
    
    // Find the closest sentence break to the ideal chunk size
    let closestBreakIndex = 0;
    let minDistance = Math.abs(sentenceBreaks[0] - idealPosition);
    
    for (let i = 1; i < sentenceBreaks.length; i++) {
      const distance = Math.abs(sentenceBreaks[i] - idealPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestBreakIndex = i;
      }
    }
    
    const breakPosition = sentenceBreaks[closestBreakIndex];
    chunks.push(text.substring(chunkStart, breakPosition).trim());
    
    chunkStart = breakPosition;
    sentenceBreaks.splice(0, closestBreakIndex + 1);
    currentChunk++;
  }
  
  // Add the final chunk
  if (chunkStart < text.length) {
    chunks.push(text.substring(chunkStart).trim());
  }
  
  return chunks;
}

/**
 * Extracts YouTube video ID from a URL
 * Client-safe function
 * 
 * @param url YouTube video URL
 * @returns YouTube video ID or null
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // For common YouTube URL formats
    const regexPatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^/?&]+)/
    ];

    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Try with URL object for standard watch URLs
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }

    console.error(`Failed to extract YouTube video ID from URL: ${url}`);
    return null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
}

/**
 * Estimates video duration based on transcription length
 * Client-safe utility function
 * 
 * @param transcription Full transcription text
 * @returns Estimated duration in seconds
 */
export function estimateVideoDuration(transcription: string): number {
  // Average reading speed is ~150 words per minute
  // We'll use that to estimate video duration
  const wordCount = transcription.split(/\s+/).length;
  const estimatedMinutes = wordCount / 150;
  
  // Convert to seconds, with minimum of 60 seconds
  return Math.max(60, Math.round(estimatedMinutes * 60));
}

/**
 * Converts YouTube watch URL to embed URL
 * Client-safe utility function
 */
export function getYouTubeEmbedUrl(url: string): string {
  // If it's already an embed URL, return it
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Extract the video ID
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    // Return original if we can't process it
    return url;
  }
  
  // Return the embed URL
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get YouTube thumbnail URL for a video
 * @param videoId The YouTube video ID
 * @returns URL to the video thumbnail
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Creates a VideoTranscription object from a YouTube URL and transcription data
 * Client-safe utility function
 */
export function createVideoTranscription(
  videoUrl: string,
  title: string,
  creator: string,
  chapters: Chapter[]
): VideoTranscription {
  // Extract video ID for thumbnail and unique ID
  const videoId = extractYouTubeVideoId(videoUrl) || '';
  
  return {
    id: videoId || uuidv4(),
    videoUrl: getYouTubeEmbedUrl(videoUrl),
    videoId,
    title,
    creator,
    chapters,
    views: '0',
    uploadDate: new Date().toISOString(),
    thumbnail: videoId 
      ? getYouTubeThumbnailUrl(videoId) 
      : 'https://placehold.co/600x400/051C3C/73ebda?text=Video+Thumbnail'
  };
} 