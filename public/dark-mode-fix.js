// This script runs immediately to set the correct theme before React hydration
// to prevent any flash of incorrect theme
(function() {
  try {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // In case of any errors, do nothing
    console.error('Dark mode initialization error:', e);
  }
})(); 