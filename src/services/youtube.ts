import { YouTubeVideo, YouTubePlaylist } from "../types/youtube";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export function extractPlaylistId(url: string): string | null {
  const regex = /[?&]list=([^&#]*)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatLargeDuration(totalSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = "";
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m `;
  if (seconds > 0) formatted += `${seconds}s`;

  return { days, hours, minutes, seconds, formatted: formatted.trim() };
}

export function calculateSpeedDuration(
  totalSeconds: number,
  speed: number
): {
  duration: number;
  formatted: string;
} {
  const adjustedDuration = Math.floor(totalSeconds / speed);
  return {
    duration: adjustedDuration,
    formatted: formatLargeDuration(adjustedDuration).formatted,
  };
}

export async function fetchPlaylistInfo(
  playlistId: string
): Promise<YouTubePlaylist> {
  const playlistResponse = await fetch(
    `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`
  );

  if (!playlistResponse.ok) {
    throw new Error("Failed to fetch playlist information");
  }

  const playlistData = await playlistResponse.json();

  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error("Playlist not found or is private");
  }

  const playlist = playlistData.items[0];
  const videos = await fetchAllPlaylistVideos(playlistId);

  return {
    id: playlist.id,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    channelTitle: playlist.snippet.channelTitle,
    thumbnail:
      playlist.snippet.thumbnails.high?.url ||
      playlist.snippet.thumbnails.default.url,
    itemCount: playlist.contentDetails.itemCount,
    videos,
    totalDuration: videos.reduce(
      (sum, video) => sum + video.durationSeconds,
      0
    ),
    publishedAt: playlist.snippet.publishedAt,
  };
}

async function fetchAllPlaylistVideos(
  playlistId: string
): Promise<YouTubeVideo[]> {
  let videos: YouTubeVideo[] = [];
  let nextPageToken = "";

  do {
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch playlist videos");
    }

    const data = await response.json();
    const videoIds = data.items
      .filter((item: any) => item.snippet.resourceId.kind === "youtube#video")
      .map((item: any) => item.snippet.resourceId.videoId);

    if (videoIds.length > 0) {
      const videoDetails = await fetchVideoDetails(videoIds);
      videos = [...videos, ...videoDetails];
    }

    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);

  return videos;
}

async function fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  const response = await fetch(
    `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(
      ","
    )}&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video details");
  }

  const data = await response.json();
  console.log(data);
  return data.items.map((video: any) => ({
    id: video.id,
    title: video.snippet.title,
    duration: video.contentDetails.duration,
    durationSeconds: parseDuration(video.contentDetails.duration),
    thumbnail:
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default.url,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics?.viewCount,
    description: video.snippet.description,
  }));
}
