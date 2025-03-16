import React, { useRef, useEffect } from 'react';
import { VideoTranscription, Chapter } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';

interface VideoModalProps {
  video: VideoTranscription;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
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
  
  const scrollToChapter = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    const videoElement = document.querySelector('iframe');
    if (videoElement && videoElement.contentWindow) {
      // For YouTube iframe API
      videoElement.contentWindow.postMessage(
        `{"event":"command","func":"seekTo","args":[${totalSeconds}, true]}`,
        '*'
      );
    }
  };
  
  // Generate a summary from chapter content
  const generateSummary = () => {
    if (!video.chapters.length) return "No summary available for this video.";
    
    const firstChapter = video.chapters[0];
    return firstChapter.content?.substring(0, 200) + "..." || 
           "This video covers " + video.chapters.map(c => c.title).join(", ") + ".";
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
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
      >
        {/* Header with title and close button */}
        <div className="bg-white border-b border-gray-200 text-gray-900 flex justify-between items-center">
          <div className="px-10 py-6 flex-1">
            <h2 className="text-xl font-bold truncate">{video.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-6 hover:bg-gray-100 transition-colors text-gray-900"
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
                src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Video info section */}
            <div className="mt-4">
              {/* Channel name below the player, aligned left */}
              {video.creator && (
                <p className="text-sm font-medium text-gray-700 mb-3 text-left">{video.creator}</p>
              )}
              
              {/* Video info */}
              <div className="flex items-center text-xs text-gray-500 justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5.25C7.8325 5.25 4.125 7.8075 2.25 11.625C4.125 15.4425 7.8325 18 12 18C16.1675 18 19.875 15.4425 21.75 11.625C19.875 7.8075 16.1675 5.25 12 5.25ZM12 15.75C9.9325 15.75 8.25 14.0675 8.25 12C8.25 9.9325 9.9325 8.25 12 8.25C14.0675 8.25 15.75 9.9325 15.75 12C15.75 14.0675 14.0675 15.75 12 15.75ZM12 9.75C10.755 9.75 9.75 10.755 9.75 12C9.75 13.245 10.755 14.25 12 14.25C13.245 14.25 14.25 13.245 14.25 12C14.25 10.755 13.245 9.75 12 9.75Z" fill="currentColor"/>
                  </svg>
                  <span>{formatViews(video.views)}</span>
                </div>
                
                {video.uploadDate && (
                  <div className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H12V16H7V11Z" fill="currentColor"/>
                    </svg>
                    <span>{formatRelativeTime(video.uploadDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content sidebar - right side */}
          <div className="w-full md:w-5/12 overflow-y-auto bg-gray-50">
            {/* Summary section */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Summary</h3>
              <p className="text-sm text-gray-600">{generateSummary()}</p>
            </div>
            
            {/* Video chapters section */}
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-3">Video Chapters</h3>
              <div className="space-y-3">
                {video.chapters.map((chapter: Chapter, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-white rounded border border-gray-200 hover:bg-[#73ebda]/10 cursor-pointer transition-colors"
                    onClick={() => scrollToChapter(chapter.startTime)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 flex-grow pr-2">{chapter.title}</span>
                      <span className="text-gray-500 font-mono text-xs">{chapter.startTime}</span>
                    </div>
                    {chapter.summary && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{chapter.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal; 