import React from 'react';
import Image from 'next/image';
import { formatRelativeTime } from '../utils/dateUtils';
import { VideoTranscription } from '../types';

// Updated interface to support both implementations
interface VideoCardProps {
  id?: string;
  title?: string;
  thumbnail?: string;
  creator?: string;
  views?: number;
  uploadDate?: string;
  onClick: ((id: string) => void) | ((video: VideoTranscription) => void);
  description?: string;
  video?: VideoTranscription;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  id, 
  title, 
  thumbnail, 
  creator, 
  views, 
  uploadDate, 
  onClick,
  description,
  video
}) => {
  // Format views number to a friendly string
  const formatViews = (viewCount?: number) => {
    if (!viewCount) return '0 views';
    
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    
    return `${viewCount} views`;
  };

  // If a video object is provided, use its properties
  const videoId = video?.id || id || '';
  const videoTitle = video?.title || title || '';
  const videoThumbnail = video?.thumbnail || thumbnail || '';
  const videoCreator = video?.creator || creator;
  const videoViews = typeof video?.views === 'string' ? parseInt(video.views) : views;
  const videoUploadDate = video?.uploadDate || uploadDate;
  const videoDescription = video?.description || description;

  const handleClick = () => {
    if (video) {
      (onClick as (video: VideoTranscription) => void)(video);
    } else {
      (onClick as (id: string) => void)(videoId);
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-md cursor-pointer group hover:shadow-lg transition-shadow flex flex-col h-full"
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={videoThumbnail} 
          alt={videoTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" className="text-gray-800 dark:text-[#73ebda]" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        {/* Video creator */}
        {videoCreator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{videoCreator}</p>
        )}
        
        {/* Video title */}
        <h3 className="font-medium text-gray-800 dark:text-white line-clamp-2 mb-2">{videoTitle}</h3>
        
        {/* Video description */}
        {videoDescription && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{videoDescription}</p>
        )}
        
        <div className="flex-grow"></div>
        
        {/* Views count and date - moved to bottom */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div>
            {formatViews(videoViews)}
          </div>
          
          {videoUploadDate && (
            <div>
              {formatRelativeTime(videoUploadDate)}
            </div>
          )}
        </div>
      </div>
      
      {/* Bookmark button */}
      <button 
        className="absolute top-2 right-2 bg-white/70 dark:bg-black/70 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-800"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the click on bookmark from triggering the card click
          // Bookmark implementation can be added here
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" className="fill-gray-800 dark:fill-[#73ebda]" />
        </svg>
      </button>
    </div>
  );
};

export default VideoCard; 