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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Video</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Video successfully added with Whisper transcription!
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter video title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="https://example.com/video"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-1">
                  Creator
                </label>
                <input
                  type="text"
                  id="creator"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter creator name"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-700 text-white py-2 px-4 rounded font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Note: This form will use OpenAI Whisper to transcribe the video audio and automatically generate chapters.</p>
            <p className="mt-1">For best results, use videos with clear audio and spoken content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideoForm; 