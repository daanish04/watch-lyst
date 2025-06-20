import { Brain, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PlaylistSummaryDrawerProps {
  summary: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistSummaryDrawer({
  summary,
  isOpen,
  onClose,
}: PlaylistSummaryDrawerProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-end justify-center">
      {/* Modal Drawer */}
      <div className="relative w-full mx-4 max-w-5xl h-[75vh] transition-all duration-400 rounded-3xl shadow-2xl border-t-2 border-primary-800 flex flex-col animate-slideup">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-900/90 rounded-t-3xl border-b border-gray-100 dark:border-gray-800 backdrop-blur-md">
          <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
            Playlist Summary
            <Brain className="ml-3 h-10 w-10 p-1.5 text-secondary-600 bg-primary-400 rounded-full" />
          </h3>
          <button onClick={onClose} aria-label="Close summary drawer">
            <X className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-7 py-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200 border border-primary-800 bg-gradient-to-br from-primary-100 via-primary-50 to-primary-100 dark:from-neutral-900 dark:via-secondary-950 dark:to-secondary-900 transition-all duration-400 rounded-es-2xl">
          {summary ? (
            <ReactMarkdown children={summary} remarkPlugins={[remarkGfm]} />
          ) : (
            <div>No summary available.</div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideup {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideup { animation: slideup 0.35s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
}
