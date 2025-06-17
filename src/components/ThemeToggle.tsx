import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-lg border border-white/20 dark:border-gray-700/20 hover:scale-110 transition-all duration-300 group"
        aria-label="Toggle theme"
      >
        <div className="relative w-6 h-6">
          <Sun
            className={`absolute inset-0 h-6 w-6 text-yellow-500 transition-all duration-400 ${
              isDark
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            className={`absolute inset-0 h-6 w-6 text-blue-400 transition-all duration-400 ${
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>
      </button>
    </div>
  );
}
