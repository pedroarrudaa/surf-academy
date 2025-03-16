import React from 'react';

export type ContentType = 'videos' | 'blogs' | 'all';

interface ContentToggleProps {
  activeType: ContentType;
  onChange: (type: ContentType) => void;
}

const ContentToggle: React.FC<ContentToggleProps> = ({ activeType, onChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeType === 'all' 
            ? 'bg-[#73ebda] text-gray-800' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeType === 'videos' 
            ? 'bg-[#73ebda] text-gray-800' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        onClick={() => onChange('videos')}
      >
        Videos
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeType === 'blogs' 
            ? 'bg-[#73ebda] text-gray-800' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        onClick={() => onChange('blogs')}
      >
        Blog Posts
      </button>
    </div>
  );
};

export default ContentToggle; 