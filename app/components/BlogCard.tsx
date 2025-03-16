import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';

interface BlogCardProps {
  blog: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const [ogData, setOgData] = useState<{image?: string, title?: string, description?: string} | null>(
    blog.ogMetadata || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(blog.isExternalUrl) && !blog.ogMetadata);
  const [imageError, setImageError] = useState(false);

  // Fetch OG metadata for external URLs that don't have metadata yet
  useEffect(() => {
    if (blog.isExternalUrl && !blog.ogMetadata && !ogData) {
      const fetchOgMetadata = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/og-metadata?url=${encodeURIComponent(blog.url)}`);
          const data = await response.json();
          
          if (data.success && data.metadata) {
            setOgData({
              image: data.metadata.image,
              title: data.metadata.title,
              description: data.metadata.description
            });
          }
        } catch (error) {
          console.error('Error fetching OG metadata:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOgMetadata();
    }
  }, [blog.isExternalUrl, blog.ogMetadata, blog.url, ogData]);

  // Check if the image URL is valid for Next.js
  const isValidImageUrl = (url: string) => {
    try {
      const { hostname } = new URL(url);
      // List of domains configured in next.config.js
      const allowedDomains = [
        'exafunction.github.io',
        'placehold.co',
        'codeium.com',
        'images.codeium.com',
        'cdn.codeium.com',
        'opengraph.githubassets.com'
      ];
      
      return allowedDomains.includes(hostname);
    } catch (e) {
      // If not a valid URL, return false
      return false;
    }
  };

  // Determine the image to display
  const imageUrl = imageError || (ogData?.image && !isValidImageUrl(ogData.image)) 
    ? '/images/default-blog-thumbnail.svg'
    : (blog.isExternalUrl 
        ? (ogData?.image && isValidImageUrl(ogData.image) ? ogData.image : '/images/default-blog-thumbnail.svg')
        : blog.imageUrl);
  
  // Determine title and description
  const title = blog.isExternalUrl && ogData?.title ? ogData.title : blog.title;
  const description = blog.isExternalUrl && ogData?.description ? ogData.description : blog.description;

  const handleImageError = () => {
    setImageError(true);
  };

  const isLocalImage = !imageUrl.startsWith('http');

  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md cursor-pointer group hover:shadow-lg transition-shadow"
    >
      <Link 
        href={blog.url}
        target={blog.isExternalUrl ? "_blank" : "_self"}
        rel={blog.isExternalUrl ? "noopener noreferrer" : ""}
        className="block"
      >
        {/* Blog thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
          ) : (
            <>
              <Image 
                src={imageUrl} 
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
                unoptimized={!isLocalImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </>
          )}
        </div>
        
        <div className="p-3">
          {/* Blog author */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">By: {blog.author}</p>
          
          {/* Blog title */}
          <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">{title}</h3>
          
          {/* Blog description */}
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">{description}</p>
          
          {/* Blog date */}
          <div className="flex justify-end">
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(blog.date)}</p>
          </div>
        </div>
      </Link>
      
      {/* Bookmark button */}
      <button 
        className="absolute top-2 right-2 bg-white/70 dark:bg-gray-800/70 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the click from triggering the card link
          // Bookmark implementation can be added here
        }}
        style={{ display: blog.isExternalUrl ? 'none' : 'block' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="fill-gray-800 dark:fill-gray-200">
          <path fillRule="evenodd" clipRule="evenodd" d="M14.5 2H9l-.35.15-.65.64-.65-.64L7 2H1.5l-.5.5v10l.5.5h5.29l.86.85h.7l.86-.85h5.29l.5-.5v-10l-.5-.5zm-7 10.32l-.18-.17L7 12H2V3h4.79l.74.74-.03 8.58zM14 12H9l-.35.15-.14.13V3.7l.7-.7H14v9zM6 5H3v1h3V5zm0 4H3v1h3V9zM3 7h3v1H3V7zm10-2h-3v1h3V5zm-3 2h3v1h-3V7zm0 2h3v1h-3V9z"/>
        </svg>
      </button>
    </div>
  );
};

export default BlogCard; 