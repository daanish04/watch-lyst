import React, { useState } from "react";
import { Search, Link, Loader2, Info } from "lucide-react";

interface PlaylistInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function PlaylistInput({
  onSubmit,
  loading,
}: PlaylistInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (url: string): boolean => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})|(?:youtube\.com\/playlist\?list=)([^"&?\/\s]+)/;
    return regex.test(url) && url.includes("list=");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      setError("Please enter a valid YouTube playlist URL");
      return;
    }

    setError("");
    onSubmit(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <Link className="inline h-4 w-4 mr-2" />
              YouTube Playlist URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                className={`w-full px-4 py-4 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 ${
                  error
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400"
                    : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400"
                } bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-pulse">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing Playlist...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Calculate Duration</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex gap-1">
            <strong>
              {" "}
              <Info />
            </strong>{" "}
            Paste any YouTube playlist URL above. The calculator works with
            public playlists and will show you the total duration, individual
            video details, and useful statistics.
          </p>
        </div>
      </div>
    </div>
  );
}
