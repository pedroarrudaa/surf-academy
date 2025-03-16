import React from 'react';
import VideoCard from './VideoCard';
import { VideoTranscription } from '../types';

interface VideoGridProps {
  videos: VideoTranscription[];
  onVideoClick: (videoId: string) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          creator={video.creator}
          views={video.views ? parseInt(video.views) : undefined}
          uploadDate={video.uploadDate}
          onClick={onVideoClick}
          description={video.description}
        />
      ))}
    </div>
  );
};

export default VideoGrid; 