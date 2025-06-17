import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import PlaylistInput from "./components/PlaylistInput";
import PlaylistResults from "./components/PlaylistResults";

import ThemeToggle from "./components/ThemeToggle";
import { YouTubePlaylist } from "./types/youtube";
import { extractPlaylistId, fetchPlaylistInfo } from "./services/youtube";
import { MoveUpRight } from "lucide-react";
import { toast, Toaster } from "sonner";

function AppContent() {
  const [playlist, setPlaylist] = useState<YouTubePlaylist | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlaylistSubmit = async (url: string) => {
    const playlistId = extractPlaylistId(url);

    if (!playlistId) {
      return;
    }

    setLoading(true);
    setPlaylist(null);

    try {
      const playlistData = await fetchPlaylistInfo(playlistId);
      setPlaylist(playlistData);
    } catch (err) {
      toast.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setPlaylist(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 transition-colors duration-100">
      <div className="min-h-screen flex flex-col gap-10 pt-10">
        <ThemeToggle />
        <header className="flex flex-col justify-start items-center gap-3">
          <div className="pt-5 flex gap-8">
            <a
              href="https://github.com/daanish04"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex text-secondary-500 bg-primary-100 py-2 px-4 rounded-full text-sm items-center font-bold">
                Github <MoveUpRight className="ml-2" size={16} />
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/daanishqan/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex text-secondary-500 bg-primary-100 py-2 px-4 rounded-full text-sm items-center font-bold">
                LinkedIn <MoveUpRight className="ml-2" size={16} />
              </span>
            </a>
          </div>
          <span className="pt-2 lg:text-8xl text-7xl font-extrabold bg-gradient-to-br from-red-600 via-rose-700 to-red-500 bg-clip-text text-transparent leading-[1.3] lg:leading-[1.5]">
            WatchLyst
          </span>
          <div className="text-lg lg:text-xl text-secondary-500 dark:text-secondary-300">
            Calculate Watch Time from Any YouTube Playlist
          </div>
          <div className="text-lg lg:text-xl text-secondary-500 dark:text-secondary-300">
            Get detailed insights and export your results
          </div>
        </header>

        <main className="pb-12">
          {!playlist && (
            <PlaylistInput onSubmit={handlePlaylistSubmit} loading={loading} />
          )}

          {playlist && (
            <>
              <PlaylistResults playlist={playlist} />

              <div className="text-center mx-auto">
                <button
                  onClick={resetApp}
                  className="inline-flex items-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg border border-white/20 dark:border-gray-700/20"
                >
                  Analyze Another Playlist
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="bg-blue-50 dark:bg-neutral-900 backdrop-blur-sm border-t-2 border-white dark:border-gray-700/20 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="text-sm">
              Made with 💝 by{" "}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Daanish Qanoongo
              </span>
            </p>
            <div className="text-xs mt-2">
              Calculate playlist durations • Export data • Analyze statistics •
              Custom speed calculations
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
