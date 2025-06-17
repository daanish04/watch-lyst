import * as XLSX from 'xlsx';
import { YouTubePlaylist } from '../types/youtube';
import { formatDuration, formatLargeDuration, calculateSpeedDuration } from './youtube';

export function exportToExcel(playlist: YouTubePlaylist) {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Playlist Summary Sheet
  const summaryData = [
    ['Playlist Information', ''],
    ['Title', playlist.title],
    ['Channel', playlist.channelTitle],
    ['Total Videos', playlist.videos.length],
    ['Total Duration', formatLargeDuration(playlist.totalDuration).formatted],
    ['Published Date', new Date(playlist.publishedAt).toLocaleDateString()],
    ['', ''],
    ['Speed Analysis', ''],
    ['Normal Speed (1x)', formatLargeDuration(playlist.totalDuration).formatted],
    ['1.25x Speed', calculateSpeedDuration(playlist.totalDuration, 1.25).formatted],
    ['1.5x Speed', calculateSpeedDuration(playlist.totalDuration, 1.5).formatted],
    ['1.75x Speed', calculateSpeedDuration(playlist.totalDuration, 1.75).formatted],
    ['2x Speed', calculateSpeedDuration(playlist.totalDuration, 2).formatted],
    ['', ''],
    ['Statistics', ''],
    ['Average Video Duration', formatDuration(Math.floor(playlist.totalDuration / playlist.videos.length))],
    ['Total Views', playlist.videos.reduce((sum, video) => sum + (parseInt(video.viewCount || '0')), 0).toLocaleString()],
    ['Longest Video', playlist.videos.reduce((longest, video) => 
      (!longest || video.durationSeconds > longest.durationSeconds) ? video : longest).title],
    ['Shortest Video', playlist.videos.reduce((shortest, video) => 
      (!shortest || video.durationSeconds < shortest.durationSeconds) ? video : shortest).title],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for summary sheet
  summarySheet['!cols'] = [
    { width: 25 },
    { width: 50 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Videos Detail Sheet
  const videoHeaders = [
    'S.No.',
    'Title',
    'Duration',
    'Duration (Seconds)',
    'Channel',
    'Views',
    'Published Date',
    'Video URL'
  ];

  const videoData = playlist.videos.map((video, index) => [
    index + 1,
    video.title,
    formatDuration(video.durationSeconds),
    video.durationSeconds,
    video.channelTitle,
    video.viewCount ? parseInt(video.viewCount).toLocaleString() : 'N/A',
    new Date(video.publishedAt).toLocaleDateString(),
    `https://youtube.com/watch?v=${video.id}`
  ]);

  const videoSheet = XLSX.utils.aoa_to_sheet([videoHeaders, ...videoData]);
  
  // Set column widths for video sheet
  videoSheet['!cols'] = [
    { width: 8 },   // S.No.
    { width: 60 },  // Title
    { width: 12 },  // Duration
    { width: 15 },  // Duration (Seconds)
    { width: 25 },  // Channel
    { width: 15 },  // Views
    { width: 15 },  // Published Date
    { width: 40 }   // Video URL
  ];

  XLSX.utils.book_append_sheet(workbook, videoSheet, 'Videos');

  // Speed Comparison Sheet
  const speeds = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5];
  const speedHeaders = ['Speed', 'Duration', 'Time Saved', 'Percentage Saved'];
  
  const speedData = speeds.map(speed => {
    const duration = calculateSpeedDuration(playlist.totalDuration, speed);
    const timeSaved = playlist.totalDuration - duration.duration;
    const percentageSaved = ((timeSaved / playlist.totalDuration) * 100).toFixed(1);
    
    return [
      `${speed}x`,
      duration.formatted,
      formatLargeDuration(timeSaved).formatted,
      `${percentageSaved}%`
    ];
  });

  const speedSheet = XLSX.utils.aoa_to_sheet([speedHeaders, ...speedData]);
  
  // Set column widths for speed sheet
  speedSheet['!cols'] = [
    { width: 10 },
    { width: 20 },
    { width: 20 },
    { width: 18 }
  ];

  XLSX.utils.book_append_sheet(workbook, speedSheet, 'Speed Analysis');

  // Generate filename
  const filename = `${playlist.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename);
}