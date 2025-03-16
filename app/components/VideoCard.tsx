import React from 'react';
import Image from 'next/image';
import { formatRelativeTime } from '../utils/dateUtils';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  creator?: string;
  views?: number;
  uploadDate?: string;
  onClick: (id: string) => void;
  description?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  id, 
  title, 
  thumbnail, 
  creator, 
  views, 
  uploadDate, 
  onClick,
  description
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

  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md cursor-pointer group hover:shadow-lg transition-shadow"
      onClick={() => onClick(id)}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={thumbnail} 
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" className="text-gray-800 dark:text-gray-200" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        {/* Video creator */}
        {creator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{creator}</p>
        )}
        
        {/* Video title */}
        <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">{title}</h3>
        
        {/* Video description */}
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{description}</p>
        )}
        
        {/* Views count and date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            {formatViews(views)}
          </div>
          
          {uploadDate && (
            <div>
              {formatRelativeTime(uploadDate)}
            </div>
          )}
        </div>
      </div>
      
      {/* Bookmark button */}
      <button 
        className="absolute top-2 right-2 bg-white/70 dark:bg-gray-800/70 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the click on bookmark from triggering the card click
          // Bookmark implementation can be added here
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" className="fill-gray-800 dark:fill-gray-200" />
        </svg>
      </button>
    </div>
  );
};

export default VideoCard; 