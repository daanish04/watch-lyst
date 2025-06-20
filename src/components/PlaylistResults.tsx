import { useEffect, useState } from "react";
import {
  Clock,
  Video,
  Eye,
  Calendar,
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  MoveUpRight,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Brain,
} from "lucide-react";
import { YouTubePlaylist, PlaylistStats } from "../types/youtube";
import { formatDuration, formatLargeDuration } from "../services/youtube";
import { exportToExcel } from "../services/excelExport";
import SpeedCalculator from "./SpeedCalculator";
import { getPlaylistSummary } from "../services/summaries";
import { toast } from "sonner";
import PlaylistSummaryDrawer from "./PlaylistSummaryDrawer";

interface PlaylistResultsProps {
  playlist: YouTubePlaylist;
}

export default function PlaylistResults({ playlist }: PlaylistResultsProps) {
  console.log("playlist", playlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"duration" | "title" | "published">(
    "published"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const itemsPerPage = 15;

  const stats: PlaylistStats = {
    totalVideos: playlist.videos.length,
    totalDuration: playlist.totalDuration,
    totalViews: playlist.videos.reduce(
      (sum, video) => sum + parseInt(video.viewCount || "0"),
      0
    ),
    averageDuration: Math.floor(
      playlist.totalDuration / playlist.videos.length
    ),
    longestVideo:
      playlist.videos.length > 0
        ? playlist.videos.reduce((longest, video) =>
            video.durationSeconds > longest.durationSeconds ? video : longest
          )
        : null,
    shortestVideo:
      playlist.videos.length > 0
        ? playlist.videos.reduce((shortest, video) =>
            video.durationSeconds < shortest.durationSeconds ? video : shortest
          )
        : null,
  };

  const filteredAndSortedVideos = playlist.videos
    .filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "duration":
          comparison = a.durationSeconds - b.durationSeconds;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "published":
          comparison =
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredAndSortedVideos.length / itemsPerPage);
  const paginatedVideos = filteredAndSortedVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportJSONData = () => {
    const data = {
      playlist: {
        title: playlist.title,
        url: `https://youtube.com/playlist?list=${playlist.id}`,
        totalDuration: formatLargeDuration(playlist.totalDuration).formatted,
        videoCount: playlist.videos.length,
      },
      videos: playlist.videos.map((video) => ({
        title: video.title,
        duration: formatDuration(video.durationSeconds),
        channel: video.channelTitle,
        views: video.viewCount,
        url: `https://youtube.com/watch?v=${video.id}`,
      })),
      statistics: {
        totalDuration: formatLargeDuration(stats.totalDuration).formatted,
        averageDuration: formatDuration(stats.averageDuration),
        longestVideo: stats.longestVideo?.title,
        shortestVideo: stats.shortestVideo?.title,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playlist.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const duration = formatLargeDuration(playlist.totalDuration);

  const handleSummary = async () => {
    try {
      setSummaryLoading(true);
      const videosForSummary = playlist.videos.map((video) => ({
        title: video.title,
        description: video.description || "",
      }));
      const summary = await getPlaylistSummary(videosForSummary);
      setSummary(summary);
      setDrawerOpen(true);
    } catch (err) {
      toast.error("Error: ", err || "");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 220, behavior: "smooth" });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8`}>
      <PlaylistSummaryDrawer
        summary={summary}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      {/* Playlist Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden transition-colors duration-300">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:space-x-8">
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              <img
                src={playlist.thumbnail}
                alt={playlist.title}
                className="w-full lg:w-64 h-48 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {playlist.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                by{" "}
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {playlist.channelTitle}
                </span>
              </p>
              {playlist.description && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {playlist.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                  <Video className="h-4 w-4 mr-1" />
                  {stats.totalVideos} videos
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200">
                  <Clock className="h-4 w-4 mr-1" />
                  {duration.formatted}
                </span>
                <span>
                  <button
                    onClick={handleSummary}
                    className="flex justify-center items-center w-full text-primary-950 bg-secondary-400 hover:bg-secondary-500 text-sm font-medium py-1.5 px-3 rounded-lg"
                  >
                    {summaryLoading ? (
                      <>
                        <span>Analyzing...</span>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>Summarize using AI</span>
                        <Brain className="ml-2 h-5 w-5" size={18} />
                      </>
                    )}
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Duration
              </p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {duration.formatted}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary-500 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Duration
              </p>
              <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                {formatDuration(stats.averageDuration)}
              </p>
            </div>
            <Video className="h-8 w-8 text-secondary-500 dark:text-secondary-400" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Views
              </p>
              <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <Eye className="h-8 w-8 text-accent-500 dark:text-accent-400" />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Videos
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalVideos}
              </p>
            </div>
            <Video className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Speed Calculator */}
      <SpeedCalculator totalDuration={playlist.totalDuration} />

      {/* Controls */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search using keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex justify-center items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "duration" | "title" | "published"
                  )
                }
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="duration">Duration</option>
                <option value="title">Title</option>
                <option value="published">Published</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => exportToExcel(playlist)}
              className="inline-flex items-center px-4 py-2 bg-accent-800 hover:bg-accent-900 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.01] shadow-lg"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </button>

            <button
              onClick={exportJSONData}
              className="inline-flex items-center px-4 py-2 bg-secondary-600 hover:bg-secondary-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.01] shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Videos ({filteredAndSortedVideos.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {paginatedVideos.map((video, index) => (
            <div
              key={video.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-xl transition-all duration-200"
            >
              <div className="relative">
                <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-primary-100 dark:bg-black text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full z-10">
                  #{(currentPage - 1) * itemsPerPage + index + 1}
                </span>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                />
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                  {video.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {video.channelTitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(video.durationSeconds)}
                  </span>
                  {video.viewCount && (
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {parseInt(video.viewCount).toLocaleString()} views
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg"
                  >
                    Watch Now <MoveUpRight className="ml-2" size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
