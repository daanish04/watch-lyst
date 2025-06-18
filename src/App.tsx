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
    <div className="bg-gradient-to-br from-white to-primary-50 dark:from-neutral-900 dark:to-neutral-800 transition-all duration-400">
      <div className="min-h-screen flex flex-col gap-10 pt-10">
        <ThemeToggle />
        <header className="flex flex-col justify-start items-center gap-3 animate-fade-in">
          <div className="pt-5 flex gap-4 md:gap-8">
            <a
              href="https://github.com/daanish04"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300"
            >
              <span className="flex text-secondary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-secondary-300 py-2 px-4 rounded-full text-sm items-center font-bold shadow-sm hover:shadow-md transition-all duration-300">
                Github <MoveUpRight className="ml-2" size={16} />
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/daanishqan/"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300"
            >
              <span className="flex text-secondary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-secondary-300 py-2 px-4 rounded-full text-sm items-center font-bold shadow-sm hover:shadow-md transition-all duration-300">
                LinkedIn <MoveUpRight className="ml-2" size={16} />
              </span>
            </a>
          </div>
          <span className="pt-2 lg:text-8xl text-7xl font-extrabold bg-gradient-to-br from-red-600 via-rose-700 to-red-500 bg-clip-text text-transparent leading-[1.3] lg:leading-[1.5] animate-gradient">
            WatchLyst
          </span>
          <div
            className="text-lg lg:text-xl text-secondary-600 dark:text-secondary-300 font-medium animate-slide-up opacity-0"
            style={{ animationDelay: "100ms" }}
          >
            Calculate Watch Time from Any YouTube Playlist
          </div>
          <div
            className="text-lg lg:text-xl text-secondary-600 dark:text-secondary-300 font-medium animate-slide-up opacity-0"
            style={{ animationDelay: "200ms" }}
          >
            Get detailed insights and export your results
          </div>
        </header>

        <main
          className="pb-12 animate-scale opacity-0"
          style={{ animationDelay: "300ms" }}
        >
          {!playlist && (
            <PlaylistInput onSubmit={handlePlaylistSubmit} loading={loading} />
          )}

          {playlist && (
            <>
              <PlaylistResults playlist={playlist} />

              <div className="text-center mx-auto mt-8">
                <button
                  onClick={resetApp}
                  className="inline-flex items-center px-6 py-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-white/20 dark:border-gray-700/20"
                >
                  Analyze Another Playlist
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="bg-gradient-to-r from-blue-50/90 to-primary-50/90 dark:from-neutral-900/90 dark:to-neutral-800/90 backdrop-blur-md border-t border-white/30 dark:border-gray-700/30 py-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="text-sm">
              Made with 💝 by{" "}
              <span className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                Daanish Qanoongo
              </span>
            </p>
            <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
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
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          className: "backdrop-blur-sm",
          style: {
            background: "var(--toast-bg, rgba(255, 255, 255, 0.9))",
            color: "var(--toast-color, #1f2937)",
            border: "1px solid var(--toast-border, rgba(255, 255, 255, 0.2))",
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
