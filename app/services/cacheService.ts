import { TranscriptionResult } from './transcriptionService';

// Cache interface to store transcription results
interface TranscriptionCache {
  [videoId: string]: {
    timestamp: number;
    result: TranscriptionResult;
  };
}

// Cache storage - this will be memory-based for client-side usage
// In a more complex app, this could use localStorage or IndexedDB
let transcriptionCache: TranscriptionCache = {};

/**
 * Maximum age of a cached transcription in milliseconds (24 hours)
 */
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Saves a transcription result to the cache
 * 
 * @param videoId - YouTube video ID to use as cache key
 * @param result - Transcription result to cache
 */
export function cacheTranscription(videoId: string, result: TranscriptionResult): void {
  if (!videoId || !result) return;
  
  console.log(`Caching transcription for video ID: ${videoId}`);
  
  transcriptionCache[videoId] = {
    timestamp: Date.now(),
    result
  };
}

/**
 * Retrieves a cached transcription if available and not expired
 * 
 * @param videoId - YouTube video ID to look up
 * @returns Cached transcription result or null if not found or expired
 */
export function getCachedTranscription(videoId: string): TranscriptionResult | null {
  if (!videoId || !transcriptionCache[videoId]) return null;
  
  const cachedItem = transcriptionCache[videoId];
  const ageInMs = Date.now() - cachedItem.timestamp;
  
  // Check if cache is expired
  if (ageInMs > CACHE_MAX_AGE) {
    console.log(`Cache expired for video ID: ${videoId} (${Math.round(ageInMs / 1000 / 60)} minutes old)`);
    delete transcriptionCache[videoId];
    return null;
  }
  
  console.log(`Using cached transcription for video ID: ${videoId} (${Math.round(ageInMs / 1000 / 60)} minutes old)`);
  return cachedItem.result;
}

/**
 * Clears all cached transcriptions
 */
export function clearTranscriptionCache(): void {
  transcriptionCache = {};
  console.log('Transcription cache cleared');
}

/**
 * Clears a specific transcription from the cache
 * 
 * @param videoId - YouTube video ID to remove from cache
 */
export function clearVideoTranscription(videoId: string): void {
  if (videoId && transcriptionCache[videoId]) {
    delete transcriptionCache[videoId];
    console.log(`Cleared cached transcription for video ID: ${videoId}`);
  }
} 