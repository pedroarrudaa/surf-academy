import React from 'react';
import VideoCard from './VideoCard';
import { VideoTranscription } from '../types';

interface VideoGridProps {
  videos: VideoTranscription[];
  onVideoClick: (videoId: string) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoClick }) => {
  // Wrapper to adapt the click function to the format expected by VideoCard
  const handleVideoClick = (video: VideoTranscription) => {
    onVideoClick(video.id);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={handleVideoClick}
        />
      ))}
    </div>
  );
};

export default VideoGrid; 