import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ShieldCheck, Sparkles, CheckCircle2, Bookmark, Share2 } from 'lucide-react';
import { YouTubeVideo } from '../services/youtube';

interface VideoPlayerModalProps {
  video: YouTubeVideo | null;
  onClose: () => void;
  onTakeNote?: (noteText: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose, onTakeNote }) => {
  const [quickNote, setQuickNote] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  if (!video) return null;

  const handleSaveNote = () => {
    if (!quickNote.trim() || !onTakeNote) return;
    onTakeNote(`[Video Note: ${video.title}]\n${quickNote}`);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm sm:text-base text-neutral-100 truncate">{video.title}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{video.channelTitle}</span>
                  {video.category && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-400 font-medium">{video.category}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck size={12} /> Safe Embed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Watch on YouTube"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Video Player (16:9) */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          {/* Description & Quick Notes Footer */}
          <div className="p-5 sm:p-6 bg-neutral-900/90 space-y-4">
            {video.description && (
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Only offer note saving when the caller supplied a real destination. */}
            {onTakeNote && <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                placeholder="Jot down a quick insight or timestamp note from this video..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSaveNote}
                disabled={!quickNote.trim()}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                  savedNote
                    ? 'bg-emerald-600 text-white'
                    : quickNote.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {savedNote ? <CheckCircle2 size={16} /> : <Bookmark size={16} />}
                {savedNote ? 'Saved!' : 'Save Note'}
              </button>
            </div>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
