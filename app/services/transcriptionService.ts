import { VideoTranscription, Chapter } from "../types";

/**
 * Service for handling video transcription using Whisper AI
 */
export async function transcribeVideo(videoUrl: string): Promise<{
  success: boolean;
  transcription?: string;
  chapters?: Chapter[];
  error?: string;
}> {
  try {
    // Call our Next.js API route
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to transcribe video');
    }

    return {
      success: true,
      transcription: data.transcription,
      chapters: data.chapters,
    };
  } catch (error) {
    console.error('Error transcribing video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Converts YouTube watch URL to embed URL
 */
export function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

/**
 * Extracts video ID from YouTube URL
 */
export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

/**
 * Generates a thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId 
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : 'https://placehold.co/600x400/051C3C/73ebda?text=Video+Thumbnail';
}

/**
 * Creates a VideoTranscription object from a YouTube URL and transcription data
 */
export function createVideoTranscription(
  videoUrl: string, 
  title: string,
  creator: string,
  chapters: Chapter[]
): VideoTranscription {
  const videoId = getYouTubeVideoId(videoUrl) || undefined;
  return {
    id: videoId || `video-${Date.now()}`,
    title,
    videoUrl: getYouTubeEmbedUrl(videoUrl),
    videoId,
    thumbnail: getYouTubeThumbnail(videoUrl),
    creator,
    views: "0",
    description: "",
    uploadDate: new Date().toISOString(),
    chapters
  };
} 