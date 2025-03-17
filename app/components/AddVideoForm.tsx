import React, { useState } from 'react';
import { transcribeVideo, createVideoTranscription } from '../services/transcriptionService';
import { VideoTranscription } from '../types';

interface AddVideoFormProps {
  onVideoAdded: (video: VideoTranscription) => void;
  onClose: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({ onVideoAdded, onClose }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl.trim() || !videoTitle.trim() || !creator.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call the transcription service
      const result = await transcribeVideo(videoUrl);
      
      if (!result.success || !result.chapters) {
        throw new Error(result.error || 'Failed to transcribe video');
      }
      
      // Create a new video transcription
      const newVideo = createVideoTranscription(
        videoUrl,
        videoTitle,
        creator,
        result.chapters
      );
      
      // Call the callback with the new video
      onVideoAdded(newVideo);
      
      // Reset form
      setVideoUrl('');
      setVideoTitle('');
      setCreator('');
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white">Add New Video</h2>
            <button onClick={onClose} className="text-black dark:text-white hover:text-black dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
              Video successfully added with transcription!
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Video Title*
                </label>
                <input
                  type="text"
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#73ebda] bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Enter video title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-black dark:text-white mb-1">
                  YouTube URL*
                </label>
                <input
                  type="text"
                  id="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#73ebda] bg-white dark:bg-black text-black dark:text-white"
                  placeholder="https://example.com/video"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="creator" className="block text-sm font-medium text-black dark:text-white mb-1">
                  Creator Name
                </label>
                <input
                  type="text"
                  id="creator"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-[#73ebda] bg-white dark:bg-black text-black dark:text-white"
                  placeholder="Enter creator name"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-[#73ebda] text-gray-800 dark:text-black py-2 px-4 rounded font-bold hover:bg-[#73ebda]/80 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800 dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Add Video'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-xs text-black dark:text-gray-300">
            <p>Chapter information and other metadata will be automatically extracted from the video.</p>
            <p className="mt-1">For best results, use videos with clear audio and spoken content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideoForm; 