export interface YouTubeVideo {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  description?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
  itemCount: number;
  videos: YouTubeVideo[];
  totalDuration: number;
  publishedAt: string;
}

export interface PlaylistStats {
  totalVideos: number;
  totalDuration: number;
  totalViews: number;
  averageDuration: number;
  longestVideo: YouTubeVideo | null;
  shortestVideo: YouTubeVideo | null;
}

export interface SpeedCalculation {
  speed: number;
  label: string;
  duration: number;
  formatted: string;
}