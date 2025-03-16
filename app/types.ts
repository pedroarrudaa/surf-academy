export interface Chapter {
  id: string;
  title: string;
  startTime: string;
  content: string;
  summary?: string;
}

export interface VideoTranscription {
  id: string;
  title: string;
  videoUrl: string;
  videoId?: string;
  thumbnail: string;
  creator?: string;
  views?: string;
  description?: string;
  uploadDate?: string;
  chapters: Chapter[];
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  date: string;
  uploadDate?: string;
  url: string;
  isExternalUrl?: boolean;
  ogMetadata?: {
    title?: string;
    image?: string;
    description?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface SearchResult {
  videos: VideoTranscription[];
  totalCount: number;
} 