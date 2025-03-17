'use client';

import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  // Use null initially to avoid hydration mismatch
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  // Initialize theme on component mount
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Check if user has a saved preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Immediately detect current state from HTML element
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const newDarkMode = !isDarkMode;
      
      // Update the DOM
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      // Update the state
      setIsDarkMode(newDarkMode);
    }
  };

  // Don't render anything until we know the initial state
  // This prevents hydration mismatch
  if (isDarkMode === null) return null;

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        // Sun icon for dark mode (switch to light)
        <svg className="w-5 h-5 text-[#73ebda]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ) : (
        // Moon icon for light mode (switch to dark)
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle; 