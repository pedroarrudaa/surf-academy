/**
 * Utility functions for date formatting
 */

/**
 * Formats a date into a relative time string (e.g. "2 hours ago", "3 days ago")
 * @param date - The date to format, can be a Date object, timestamp, or date string
 * @returns A string representing the relative time
 */
export function formatRelativeTime(date: Date | number | string): string {
  const now = new Date();
  const parsedDate = typeof date === 'object' ? date : new Date(date);
  
  // Time difference in milliseconds
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  // Return relative time based on the time difference
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  } else {
    // Avoid showing "0 years ago"
    if (diffYears === 0) {
      // If we're here but diffYears is 0, use months instead
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  }
}

/**
 * Formats a date string into a short date format (e.g. "Jan 15, 2024")
 * @param dateString - The date string to format
 * @returns A formatted date string
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
} 