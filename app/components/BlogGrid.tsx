import React from 'react';
import BlogCard from './BlogCard';
import { BlogPost } from '../types';

interface BlogGridProps {
  blogs: BlogPost[];
}

const BlogGrid: React.FC<BlogGridProps> = ({ blogs }) => {
  // Function to handle blog clicks
  // Esta função não é mais necessária, pois o BlogCard já tem seu próprio comportamento de clique
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
        />
      ))}
    </div>
  );
};

export default BlogGrid; 