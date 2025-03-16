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
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Videos section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Videos</h2>
            
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Blog Posts</h2>
            
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
    </div>
  );
}
