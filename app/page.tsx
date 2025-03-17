'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoGrid from './components/VideoGrid';
import BlogGrid from './components/BlogGrid';
import VideoModal from './components/VideoModal';
import AddVideoForm from './components/AddVideoForm';
import Pagination from './components/Pagination';
import { VideoTranscription, BlogPost } from './types';
import mockVideosRaw from './data/mockVideos';
import mockBlogPostsRaw from './data/mockBlogPosts';

// Convert raw data to correct types
const mockVideosData: VideoTranscription[] = mockVideosRaw.map(video => ({
  ...video,
  videoId: video.videoUrl.split('embed/')[1] || '',
  views: video.views?.toString() || '0',
  description: video.chapters[0]?.content.substring(0, 100) + '...' || '',
}));

// Sort blogs by publication date (most recent first)
const mockBlogPosts: BlogPost[] = [...mockBlogPostsRaw]
  .sort((a, b) => {
    // Sort by date (descending)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

export default function Home() {
  // Video state
  const [videoPage, setVideoPage] = useState(1);
  const [videoFilter, setVideoFilter] = useState<'newest' | 'popular'>('newest');
  const [allVideos, setAllVideos] = useState<VideoTranscription[]>(getSortedVideos(mockVideosData, 'newest'));
  
  // Blog state
  const [blogPage, setBlogPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>(mockBlogPosts);
  
  // General state
  const [selectedVideo, setSelectedVideo] = useState<VideoTranscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const videosPerPage = 6; // 2 lines of 3 videos
  const blogsPerPage = 6; // Same number to maintain consistency
  
  // Function to sort videos based on filter
  function getSortedVideos(videos: VideoTranscription[], filter: 'newest' | 'popular') {
    if (filter === 'popular') {
      // Sort by views (descending)
      return [...videos].sort((a, b) => {
        const viewsA = parseInt(a.views || '0');
        const viewsB = parseInt(b.views || '0');
        return viewsB - viewsA;
      });
    } else {
      // Sort by upload date (descending)
      return [...videos].sort((a, b) => {
        if (!a.uploadDate || !b.uploadDate) return 0;
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
    }
  }

  // Handle video filter change
  const handleVideoFilterChange = (filter: string) => {
    const newFilter = filter as 'newest' | 'popular';
    setVideoFilter(newFilter);
    
    // Apply filter to current videos
    setAllVideos(getSortedVideos(
      searchTerm ? allVideos : mockVideosData, 
      newFilter
    ));
  };
  
  // When a video is clicked, open the modal
  const handleVideoClick = (id: string) => {
    const video = allVideos.find(v => v.id === id);
    if (video) {
      setSelectedVideo(video);
      setIsModalOpen(true);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Content filtering based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Maintain original sorting when there's no search
      setAllVideos(getSortedVideos(mockVideosData, videoFilter));
      setAllBlogs(mockBlogPosts);
      return;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase();
    
    // Filter videos
    const filteredVideos = mockVideosData.filter(video => 
      video.title.toLowerCase().includes(normalizedSearchTerm) ||
      video.creator?.toLowerCase().includes(normalizedSearchTerm) ||
      video.chapters.some(chapter => 
        chapter.title.toLowerCase().includes(normalizedSearchTerm) ||
        chapter.content.toLowerCase().includes(normalizedSearchTerm)
      )
    );
    
    // Apply current sorting to filtered results
    setAllVideos(getSortedVideos(filteredVideos, videoFilter));
    
    // Filter blogs
    const filteredBlogs = mockBlogPosts.filter(blog => 
      blog.title.toLowerCase().includes(normalizedSearchTerm) ||
      blog.description.toLowerCase().includes(normalizedSearchTerm) ||
      blog.author.toLowerCase().includes(normalizedSearchTerm)
    );
    
    setAllBlogs(filteredBlogs);
  }, [searchTerm, videoFilter]);
  
  // Paginated content
  const totalVideoPages = Math.ceil(allVideos.length / videosPerPage);
  const totalBlogPages = Math.ceil(allBlogs.length / blogsPerPage);
  
  // Get the current videos for the current page
  const getCurrentVideos = () => {
    const startIndex = (videoPage - 1) * videosPerPage;
    return allVideos.slice(startIndex, startIndex + videosPerPage);
  };
  
  // Get the current blogs for the current page
  const getCurrentBlogs = () => {
    const startIndex = (blogPage - 1) * blogsPerPage;
    return allBlogs.slice(startIndex, startIndex + blogsPerPage);
  };
  
  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Mock for video addition (only UI)
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  
  const handleAddVideo = (video: VideoTranscription) => {
    setAllVideos(prev => [video, ...prev]);
    setShowAddVideoForm(false);
  };
  
  // New state for content submission form
  const [showSubmitContentForm, setShowSubmitContentForm] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Submit Content Button */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowSubmitContentForm(true)}
            className="bg-[#73ebda] text-gray-800 dark:text-black px-4 py-2 rounded-md hover:bg-[#73ebda]/80 transition-colors font-bold"
          >
            Submit Content
          </button>
        </div>
        
        {/* Videos section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Videos</h2>
            
            <div className="flex items-center">
              {totalVideoPages > 1 && (
                <Pagination
                  currentPage={videoPage}
                  totalPages={totalVideoPages}
                  onPageChange={setVideoPage}
                  filter={videoFilter}
                  onFilterChange={handleVideoFilterChange}
                  showFilter={true}
                />
              )}
            </div>
          </div>
          
          <VideoGrid videos={getCurrentVideos()} onVideoClick={handleVideoClick} />
        </section>
        
        {/* Blogs section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Blog Posts</h2>
            
            {totalBlogPages > 1 && (
              <Pagination
                currentPage={blogPage}
                totalPages={totalBlogPages}
                onPageChange={setBlogPage}
              />
            )}
        </div>
          
          <BlogGrid blogs={getCurrentBlogs()} />
        </section>
      </main>
      
      {selectedVideo && isModalOpen && (
        <VideoModal 
          key={`video-modal-${selectedVideo.id}`}
          video={selectedVideo}
          onClose={closeModal}
        />
      )}
      
      {showAddVideoForm && (
        <AddVideoForm 
          onVideoAdded={handleAddVideo} 
          onClose={() => setShowAddVideoForm(false)}
        />
      )}
      
      {/* Submit Content Form */}
      {showSubmitContentForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl dark:shadow-[#73ebda]/5">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Submit Content</h2>
            
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const url = formData.get('url') as string;
              const contentType = formData.get('contentType') as string;
              
              // Here you would typically send this data to your backend
              console.log('Submitting:', { url, contentType });
              
              // For now, just close the form
              setShowSubmitContentForm(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="url">
                  Content URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/your-content"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="contentType">
                  Content Type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-gray-800 dark:text-white"
                >
                  <option value="video">Video</option>
                  <option value="blog">Blog Post</option>
                </select>
              </div>
              
              {/* Button group - centered */}
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitContentForm(false)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#73ebda] text-gray-800 dark:text-black rounded-md hover:bg-[#73ebda]/80 font-bold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
