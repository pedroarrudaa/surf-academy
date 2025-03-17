import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoTranscription, Chapter } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';
import { transcribeVideo, extractYouTubeVideoId } from '../services/transcriptionService';

// Map to store transcriptions that have already been processed
// This persists even when the modal is closed
const processedTranscriptionsMap = new Map<string, {
  transcription: string;
  chapters: Chapter[];
  summary: string;
}>();

interface VideoModalProps {
  video: VideoTranscription;
  onClose: () => void;
}

// Status to track the transcription process
enum TranscriptionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  TRANSCRIBING = 'transcribing',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

interface TranscriptionData {
  transcription: string;
  chapters: Chapter[];
  summary: string;
  sessionId?: string; // Add sessionId for webhook support
  pollUrl?: string;   // Add polling URL for webhook support
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [processedChapters, setProcessedChapters] = useState<Chapter[]>([]);
  const [rawTranscription, setRawTranscription] = useState<string | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionStatus>(TranscriptionStatus.LOADING);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [shouldAlwaysTranscribe, setShouldAlwaysTranscribe] = useState(false); // Only transcribe if needed
  const videoIdRef = useRef<string>(video.id);
  const initialization = useRef<boolean>(false);
  
  // Convert "MM:SS" to seconds
  const convertTimeToSeconds = (time: string): number => {
    const [minutes, seconds] = time.split(':').map(Number);
    return (minutes * 60) + (seconds || 0);
  };
  
  // Function to process chapters and ensure timestamps are valid
  const processChapters = useCallback((chapters: Chapter[], maxDuration: number) => {
    console.log(`Processing ${chapters.length} chapters with max duration: ${maxDuration}s`);
    
    // Convert max duration to seconds
    const maxSeconds = maxDuration;
    
    const processed = chapters
      .map(chapter => {
        // Parse timestamp to seconds
        const [minutes, seconds] = chapter.startTime.split(':').map(Number);
        const timeInSeconds = minutes * 60 + seconds;
        
        // Validate timestamp
        const isValid = !isNaN(timeInSeconds) && timeInSeconds <= maxSeconds;
        
        if (!isValid) {
          console.log(`Filtered out invalid chapter "${chapter.title}" with timestamp ${chapter.startTime} (${timeInSeconds}s > ${maxSeconds}s)`);
        }
        
        return {
          ...chapter,
          timeInSeconds,
          isValid
        };
      })
      .filter(chapter => chapter.isValid) // Filter invalid chapters
      .sort((a, b) => a.timeInSeconds - b.timeInSeconds); // Sort by time
    
    console.log(`After processing: ${processed.length} valid chapters`);
    return processed;
  }, []);

  // Get a sensible default duration based on video data
  const getDefaultDurationFromVideo = useCallback((video: VideoTranscription): number => {
    // Look at the last chapter's timestamp if available
    if (video.chapters && video.chapters.length > 0) {
      const lastChapter = [...video.chapters].sort((a, b) => {
        const timeA = convertTimeToSeconds(a.startTime);
        const timeB = convertTimeToSeconds(b.startTime);
        return timeB - timeA;
      })[0];
      
      if (lastChapter) {
        // Add 2 minutes to the last chapter's time as a rough estimate
        return convertTimeToSeconds(lastChapter.startTime) + 120;
      }
    }
    
    // Try to extract duration from YouTube URL if possible
    if (video.videoUrl && video.videoUrl.includes('youtube.com')) {
      const urlParams = new URLSearchParams(new URL(video.videoUrl).search);
      const tParam = urlParams.get('t');
      if (tParam) {
        const seconds = parseInt(tParam);
        if (!isNaN(seconds) && seconds > 0) {
          return seconds;
        }
      }
    }
    
    // Default fallback - 6:32
    return 392;
  }, [convertTimeToSeconds]);
  
  // Reset modal state when switching videos
  const resetModalState = useCallback(() => {
    setVideoDuration(null);
    setProcessedChapters([]);
    setRawTranscription(null);
    setTranscriptionStatus(TranscriptionStatus.LOADING);
    setTranscriptionProgress(0);
    setTranscriptionError(null);
    setAttemptCount(0);
    setShouldAlwaysTranscribe(false);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);
  
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // Check for video ID changes
  useEffect(() => {
    console.log(`Video changed - Current: ${video.id}, Previous: ${videoIdRef.current}`);
    
    // Reset state and initialization when video changes
    if (video.id !== videoIdRef.current) {
      console.log(`Video ID changed from ${videoIdRef.current} to ${video.id}`);
      resetModalState();
      initialization.current = false;
      videoIdRef.current = video.id;
    }
  }, [video.id, resetModalState]);

  // Initialize state when video changes
  useEffect(() => {
    // Check if we need to initialize (either first time or after reset)
    if (!initialization.current) {
      console.log(`Initializing video modal with ID: ${video.id}`);
      initialization.current = true;
      
      console.log(`Video chapters data:`, JSON.stringify(video.chapters));
      
      // Get default duration from video data if available
      const defaultDuration = getDefaultDurationFromVideo(video);
      setVideoDuration(defaultDuration);
      
      // Extract video ID for caching purposes
      const videoId = extractYouTubeVideoId(video.videoUrl);
      
      // Check if we already have this transcription processed
      if (videoId && processedTranscriptionsMap.has(videoId)) {
        console.log(`Using previously processed transcription for video ID: ${videoId}`);
        const cachedData = processedTranscriptionsMap.get(videoId)!;
        
        setRawTranscription(cachedData.transcription);
        setProcessedChapters(cachedData.chapters);
        setTranscriptionStatus(TranscriptionStatus.COMPLETE);
        setTranscriptionProgress(100);
        setShouldAlwaysTranscribe(false);
      } else {
        // Set to IDLE to start a new transcription
        console.log('Setting transcription status to IDLE to trigger new transcription');
        setTranscriptionStatus(TranscriptionStatus.IDLE);
        setShouldAlwaysTranscribe(true);
        
        // If we have existing chapters, show them temporarily while transcribing
        if (video.chapters && video.chapters.length > 0) {
          const validChapters = processChapters(video.chapters, defaultDuration);
          // Only use these chapters temporarily until real transcription is done
          setProcessedChapters(validChapters);
        }
      }
    }
  }, [video.id, video.chapters, video.videoUrl, getDefaultDurationFromVideo, processChapters, initialization]);

  // Detect video duration and validate chapters when iframe loads
  useEffect(() => {
    // Skip if no iframe is ready
    if (!document.querySelector('iframe')) return;
    
    // Add listener for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      // Look for message with video duration data
      if (event.data && typeof event.data === 'object' && event.data.type === 'videoDuration') {
        const duration = Number(event.data.duration);
        if (!isNaN(duration)) {
          console.log(`Received video duration from iframe: ${duration}s`);
          setVideoDuration(duration);
          
          // Re-validate chapters with actual duration if we have any
          if (processedChapters.length > 0) {
            const validChapters = processChapters(processedChapters, duration);
            setProcessedChapters(validChapters);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Set up listener for YouTube iframe
    const videoElement = document.querySelector('iframe');
    if (videoElement && videoElement.contentWindow) {
      console.log('Setting up YouTube iframe API listener');
      // For YouTube iframe API
      setTimeout(() => {
        videoElement.contentWindow?.postMessage('{"event":"listening"}', '*');
        videoElement.contentWindow?.postMessage('{"event":"command","func":"getDuration","args":[]}', '*');
      }, 1000);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [processChapters, processedChapters, video.id]);

  // Perform the transcription when requested
  const performTranscription = useCallback(async () => {
    if (!video.videoUrl || transcriptionStatus === TranscriptionStatus.TRANSCRIBING) {
      return;
    }
    
    try {
      setTranscriptionStatus(TranscriptionStatus.TRANSCRIBING);
      setTranscriptionProgress(10);
      setTranscriptionError(null);
      setAttemptCount(prev => prev + 1);
      
      console.log(`Starting transcription for video: ${video.videoUrl} (attempt ${attemptCount + 1})`);
      
      // Extract video ID for caching
      const videoId = extractYouTubeVideoId(video.videoUrl);
      
      // Call the API to transcribe the video
      const result = await transcribeVideo(video.videoUrl);
      console.log(`Transcription API response:`, JSON.stringify(result));
      
      // Check if we need to poll for results (webhook flow)
      if (result.success && result.sessionId && result.pollUrl) {
        console.log(`Transcription started with sessionId: ${result.sessionId}, starting polling`);
        setTranscriptionProgress(20);
        
        // Start polling for result
        await pollForTranscriptionResults(result.pollUrl, result.sessionId);
        return;
      }
      
      // Handle immediate response (no webhook)
      if (result.success && result.transcription && result.chapters) {
        console.log(`Transcription completed: ${result.transcription.length} characters, ${result.chapters.length} chapters`);
        setTranscriptionProgress(80);
        setRawTranscription(result.transcription);
        
        setTranscriptionStatus(TranscriptionStatus.PROCESSING);
        
        // Use actual video duration if available, otherwise use a default
        const durationToUse = videoDuration || getDefaultDurationFromVideo(video);
        
        // Process and validate the chapters
        const validChapters = processChapters(result.chapters, durationToUse);
        
        if (validChapters.length === 0) {
          throw new Error('No valid chapters could be extracted from the transcription');
        }
        
        setProcessedChapters(validChapters);
        setTranscriptionStatus(TranscriptionStatus.COMPLETE);
        setTranscriptionProgress(100);
        setShouldAlwaysTranscribe(false); // Don't transcribe again once we have results
        
        // Store the processed transcription for future use
        if (videoId) {
          processedTranscriptionsMap.set(videoId, {
            transcription: result.transcription,
            chapters: validChapters,
            summary: result.summary || ''
          });
          console.log(`Transcription stored in memory for video ID: ${videoId}`);
        }
      } else {
        throw new Error(result.error || 'Failed to transcribe video');
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      setTranscriptionError(error instanceof Error ? error.message : 'Unknown error during transcription');
      setTranscriptionStatus(TranscriptionStatus.ERROR);
    }
  }, [video.videoUrl, transcriptionStatus, attemptCount, videoDuration, getDefaultDurationFromVideo, processChapters, video]);

  // Handle real-time transcription based on status
  useEffect(() => {
    // Always transcribe when in IDLE state, regardless of whether there are existing chapters
    if (transcriptionStatus === TranscriptionStatus.IDLE && shouldAlwaysTranscribe) {
      const timer = setTimeout(() => {
        console.log('Automatically starting transcription for video');
        performTranscription();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [transcriptionStatus, shouldAlwaysTranscribe, performTranscription]);
  
  const scrollToChapter = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    // Ensure we don't try to navigate beyond the video duration
    if (videoDuration && totalSeconds > videoDuration) {
      console.warn(`Timestamp ${time} exceeds video duration (${videoDuration}s)`);
      return;
    }
    
    const videoElement = document.querySelector('iframe');
    if (videoElement && videoElement.contentWindow) {
      console.log(`Seeking to ${time} (${totalSeconds}s)`);
      // For YouTube iframe API
      videoElement.contentWindow.postMessage(
        `{"event":"command","func":"seekTo","args":[${totalSeconds}, true]}`,
        '*'
      );
    }
  };
  
  // Generate a summary from chapter content or transcription
  const generateSummary = () => {
    // Default message if no summary is available
    let summary = "No summary available for this video.";
    
    // First priority: If we received a specific summary from the API with the transcription result
    // This would be the enhanced summary from ChatGPT or AssemblyAI
    const videoId = extractYouTubeVideoId(video.videoUrl);
    if (videoId && processedTranscriptionsMap.has(videoId)) {
      const cachedData = processedTranscriptionsMap.get(videoId)!;
      if (cachedData.summary && cachedData.summary.length > 0) {
        console.log(`Using cached summary for video ID: ${videoId}`);
        return cachedData.summary;
      }
    }
    
    // Second priority: Use the full transcription text if available
    if (rawTranscription && rawTranscription.length > 0) {
      // We're prioritizing the full transcription to provide a more comprehensive summary
      // This is used when we don't have an enhanced summary from the API
      console.log(`Generating display summary from raw transcription of ${rawTranscription.length} characters`);
      
      // For display purposes, we'll still limit what we show to avoid overwhelming the UI
      // But the full text was used in the API for analysis
      const displaySummary = rawTranscription.substring(0, 500) + "...";
      return displaySummary;
    }
    
    // Last resort: If no transcription is available, use chapter content
    if (processedChapters.length > 0) {
      // Use combined chapter content to create a better overview of the whole video
      // rather than just using the first chapter
      const combinedContent = processedChapters
        .map(chapter => chapter.content)
        .join(" | ")
        .substring(0, 300);
      
      summary = `${combinedContent}...` || 
                "This video covers " + processedChapters.map(c => c.title).join(", ") + ".";
      
      console.log(`Generated summary from combined chapter content`);
    }
    
    return summary;
  };
  
  // Format views number to a friendly string
  const formatViews = (viewCount?: string) => {
    if (!viewCount) return '0 views';
    
    const numViews = parseInt(viewCount);
    if (numViews >= 1000000) {
      return `${(numViews / 1000000).toFixed(1)}M views`;
    } else if (numViews >= 1000) {
      return `${(numViews / 1000).toFixed(1)}K views`;
    }
    
    return `${viewCount} views`;
  };

  // Manually trigger transcription
  const handleManualTranscribe = () => {
    if (transcriptionStatus !== TranscriptionStatus.TRANSCRIBING) {
      // Reset any existing processed chapters to ensure we use the new transcription
      if (processedChapters.length > 0) {
        setProcessedChapters([]);
      }
      setShouldAlwaysTranscribe(true);
      performTranscription();
    }
  };
  
  // Render content based on transcription status
  const renderSummaryContent = () => {
    if (transcriptionStatus === TranscriptionStatus.COMPLETE && processedChapters.length > 0) {
      const summary = generateSummary();
      
      // Check if the summary contains bullet points
      if (summary.includes('•')) {
        // Format bullet points nicely
        const formattedSummary = summary
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => (
            <p key={line.substring(0, 20)} className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {line}
            </p>
          ));
        
        return <div className="space-y-1">{formattedSummary}</div>;
      }
      
      // Regular text summary
      return <p className="text-sm text-gray-600 dark:text-gray-300">{summary}</p>;
    }
    
    switch (transcriptionStatus) {
      case TranscriptionStatus.LOADING:
        return <p className="text-sm text-gray-600 dark:text-gray-300">Loading video information...</p>;
        
      case TranscriptionStatus.TRANSCRIBING:
        return (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Analyzing video content... ({transcriptionProgress}%)
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-[#73ebda] h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${transcriptionProgress}%` }}
              ></div>
            </div>
          </div>
        );
        
      case TranscriptionStatus.PROCESSING:
        return (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Processing transcription data... ({transcriptionProgress}%)
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-[#73ebda] h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${transcriptionProgress}%` }}
              ></div>
            </div>
          </div>
        );
        
      case TranscriptionStatus.ERROR:
        return (
          <div>
            <p className="text-sm text-red-500 dark:text-red-400">
              Error: {transcriptionError || 'Failed to analyze video'}
            </p>
          </div>
        );
        
      case TranscriptionStatus.IDLE:
        // Show temporary chapters while waiting for transcription to start
        if (processedChapters.length > 0) {
          return (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{generateSummary()}</p>
              <p className="text-xs text-amber-500 mt-2">Preparing to analyze video for better results...</p>
            </div>
          );
        }
        
        return (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Preparing to analyze this video...
            </p>
          </div>
        );
        
      default:
        return <p className="text-sm text-gray-600 dark:text-gray-300">No summary available for this video.</p>;
    }
  };
  
  // Render chapters based on transcription status
  const renderChaptersContent = () => {
    // Check each specific state to avoid incompatible type errors
    if (transcriptionStatus === TranscriptionStatus.LOADING) {
      return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${transcriptionProgress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Analyzing video for accurate chapters...
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    if (transcriptionStatus === TranscriptionStatus.IDLE) {
      return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${transcriptionProgress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Preparing to analyze video...
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    if (transcriptionStatus === TranscriptionStatus.TRANSCRIBING || 
        transcriptionStatus === TranscriptionStatus.PROCESSING) {
      return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${transcriptionProgress}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Analyzing video for accurate chapters...
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (transcriptionStatus === TranscriptionStatus.ERROR) {
      return (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
          <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-red-500 dark:text-red-400 text-sm">
              {transcriptionError || 'Error fetching video chapters.'}
            </p>
          </div>
        </div>
      );
    }

    // Complete state with chapters
    if (transcriptionStatus === TranscriptionStatus.COMPLETE) {
      if (processedChapters.length > 0) {
        return (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
            <div className="space-y-3">
              {processedChapters.map((chapter: Chapter, index: number) => (
                <div 
                  key={`${video.id}-chapter-${chapter.id || index}`}
                  className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:bg-[#73ebda]/10 cursor-pointer transition-colors"
                  onClick={() => scrollToChapter(chapter.startTime)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-gray-100 flex-grow pr-2">{chapter.title}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">{chapter.startTime}</span>
                  </div>
                  {chapter.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {chapter.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    // Default - no chapters available
    return (
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Chapters</h3>
        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-sm">No chapters available for this video.</p>
        </div>
      </div>
    );
  };
  
  // New function to poll for transcription results
  const pollForTranscriptionResults = useCallback(async (pollUrl: string, sessionId: string) => {
    console.log('Starting polling for transcription results');
    
    // Maximum number of polling attempts before giving up
    const maxAttempts = 60; // 5 minutes at 5 second intervals
    const pollInterval = 5000; // 5 seconds
    
    let progress = 30; // Start at 30% progress
    setTranscriptionProgress(progress);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Polling attempt ${attempt + 1}/${maxAttempts}`);
        setTranscriptionProgress(Math.min(90, progress + attempt)); // Increment progress with each poll
        
        const response = await fetch(`${pollUrl}/${sessionId}`);
        
        if (!response.ok) {
          console.warn('Polling endpoint returned error, trying again');
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }
        
        const data = await response.json();
        
        if (data.status === 'completed') {
          console.log('Transcription completed successfully via polling');
          
          // Set the raw transcription
          if (data.transcription) {
            setRawTranscription(data.transcription);
          }
          
          // Set to processing state while we process chapters
          setTranscriptionStatus(TranscriptionStatus.PROCESSING);
          setTranscriptionProgress(95);
          
          // Process and validate the chapters if available
          if (data.chapters && data.chapters.length > 0) {
            const videoId = extractYouTubeVideoId(video.videoUrl);
            const durationToUse = videoDuration || getDefaultDurationFromVideo(video);
            const validChapters = processChapters(data.chapters, durationToUse);
            
            if (validChapters.length > 0) {
              setProcessedChapters(validChapters);
              
              // Store the processed transcription for future use
              if (videoId) {
                processedTranscriptionsMap.set(videoId, {
                  transcription: data.transcription || '',
                  chapters: validChapters,
                  summary: data.summary || ''
                });
                console.log(`Transcription stored in memory for video ID: ${videoId}`);
              }
            } else {
              console.warn('Could not extract valid chapters');
            }
          }
          
          // Complete the process
          setTranscriptionStatus(TranscriptionStatus.COMPLETE);
          setTranscriptionProgress(100);
          setShouldAlwaysTranscribe(false);
          return;
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Transcription failed');
        } else {
          // Still processing, continue polling
          console.log(`Transcription status: ${data.status || 'processing'}`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error('Error during polling for results:', error);
        // Don't fail immediately on polling errors, try again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    // If we've reached max attempts without completion
    throw new Error('Timeout while waiting for transcription results');
  }, [video.videoUrl, videoDuration, getDefaultDurationFromVideo, processChapters]);
  
  console.log(`Rendering VideoModal for: ${video.id} - Status: ${transcriptionStatus}, Chapters: ${processedChapters.length}`);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
      >
        {/* Header with title and close button */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 flex justify-between items-center">
          <div className="px-10 py-6 flex-1">
            <h2 className="text-xl font-bold truncate">{video.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Video container - left side */}
          <div className="w-full md:w-7/12 flex flex-col px-10 py-6">
            <div className="bg-black relative pt-[56.25%] flex items-center justify-center">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={video.videoId 
                  ? `https://www.youtube.com/embed/${video.videoId}?enablejsapi=1` 
                  : video.videoUrl.includes('embed') 
                    ? `${video.videoUrl}?enablejsapi=1` 
                    : video.videoUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Video info section */}
            <div className="mt-4">
              {/* Channel name below the player, aligned left */}
              {video.creator && (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-left">{video.creator}</p>
              )}
              
              {/* Video info */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex items-center">
                  <span>{formatViews(video.views)}</span>
                </div>
                
                {video.uploadDate && (
                  <div className="flex items-center">
                    <span>{formatRelativeTime(video.uploadDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content sidebar - right side */}
          <div className="w-full md:w-5/12 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {/* Summary section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Summary</h3>
              {renderSummaryContent()}
            </div>
            
            {/* Video chapters section - now with proper title and container */}
            {renderChaptersContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal; 