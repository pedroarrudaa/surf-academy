import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filter?: string;
  onFilterChange?: (filter: string) => void;
  showFilter?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  filter = 'newest',
  onFilterChange,
  showFilter = false
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const displayRange = 1; // Show fewer page numbers
    
    // Always show first page
    pages.push(
      <PageButton 
        key="page-1" 
        page={1} 
        isActive={currentPage === 1} 
        onClick={onPageChange} 
      />
    );
    
    // If there's a gap after page 1, show ellipsis
    if (currentPage - displayRange > 2) {
      pages.push(
        <div key="ellipsis-1" className="px-1 flex items-center">
          <span className="text-gray-400">...</span>
        </div>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - displayRange); i <= Math.min(totalPages - 1, currentPage + displayRange); i++) {
      pages.push(
        <PageButton
          key={`page-${i}`}
          page={i}
          isActive={currentPage === i}
          onClick={onPageChange}
        />
      );
    }
    
    // If there's a gap before the last page, show ellipsis
    if (currentPage + displayRange < totalPages - 1) {
      pages.push(
        <div key="ellipsis-2" className="px-1 flex items-center">
          <span className="text-gray-400">...</span>
        </div>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <PageButton
          key={`page-${totalPages}`}
          page={totalPages}
          isActive={currentPage === totalPages}
          onClick={onPageChange}
        />
      );
    }
    
    return pages;
  };
  
  return (
    <div className="flex justify-end items-center space-x-2">
      {showFilter && onFilterChange && (
        <div className="mr-4">
          <select
            className="px-2 py-1.5 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#73ebda]"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      )}
      
      <button
        className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-[#73ebda]/20 dark:hover:bg-[#73ebda]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors text-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Previous</span>
      </button>
      
      <div className="hidden md:flex items-center space-x-1 mx-1">
        {renderPageNumbers()}
      </div>
      
      <button
        className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-[#73ebda]/20 dark:hover:bg-[#73ebda]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors text-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span>Next</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

const PageButton: React.FC<{
  page: number;
  isActive: boolean;
  onClick: (page: number) => void;
}> = ({ page, isActive, onClick }) => {
  return (
    <button
      className={`w-8 h-8 rounded-md flex items-center justify-center ${
        isActive 
          ? 'bg-[#73ebda] text-gray-800 dark:text-black font-medium' 
          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-[#73ebda]/20 dark:hover:bg-[#73ebda]/10'
      } transition-colors`}
      onClick={() => onClick(page)}
    >
      {page}
    </button>
  );
};

export default Pagination; 