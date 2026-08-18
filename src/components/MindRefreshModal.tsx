import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  X, 
  PlayCircle, 
  Wind, 
  Music, 
  Trees, 
  Activity, 
  CloudRain, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { YouTubeVideo, getMindRefreshVideos } from '../services/youtube';

interface MindRefreshModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindRefreshModal: React.FC<MindRefreshModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', label: 'All Breaks', icon: Sparkles },
    { id: 'lo-fi', label: 'Lo-Fi Beats', icon: Music },
    { id: 'breathing', label: '5-Min Breathwork', icon: Wind },
    { id: 'nature', label: 'Nature Streams', icon: Trees },
    { id: 'stretching', label: 'Desk Stretches', icon: Activity },
    { id: 'rain', label: 'Ambient Rain', icon: CloudRain },
  ];

  useEffect(() => {
    if (isOpen) {
      loadBreakVideos(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const loadBreakVideos = async (cat: string) => {
    setLoading(true);
    try {
      const results = await getMindRefreshVideos(cat);
      setVideos(results);
      if (results.length > 0 && !activeVideo) {
        setActiveVideo(results[0]);
      }
    } catch (err) {
      console.error('Failed to load break videos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 overflow-y-auto text-white"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between gap-4 shrink-0 bg-neutral-900/90">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <Coffee size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-100 flex items-center gap-2">
                  Mind Refresh Zone
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase">
                    Study Break
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Restore mental energy with relaxing music, guided breathing, and soothing nature sounds.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="px-5 py-3 border-b border-neutral-800 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-neutral-950/40" data-horizontal-scroller="carousel">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <Icon size={14} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Main Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              {activeVideo ? (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-neutral-800 shadow-2xl">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm">
                  Select a relaxation video from the playlist
                </div>
              )}

              {activeVideo && (
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-neutral-100">{activeVideo.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{activeVideo.channelTitle}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{activeVideo.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck size={12} /> Distraction Free
                    </span>
                  </div>
                  {activeVideo.description && (
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Video Playlist Sidebar (1 Col) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Refresh Streams & Exercises
              </h4>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {videos.map((v) => {
                  const isCurrent = activeVideo?.videoId === v.videoId;
                  return (
                    <button
                      key={v.videoId}
                      onClick={() => setActiveVideo(v)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                        isCurrent
                          ? 'border-amber-500/60 bg-amber-500/10'
                          : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="relative aspect-video w-24 rounded-lg overflow-hidden bg-black shrink-0">
                        <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <PlayCircle size={16} className={isCurrent ? 'text-amber-400' : 'text-white'} />
                        </div>
                      </div>

                      <div className="overflow-hidden flex-1">
                        <div className={`text-xs font-bold line-clamp-2 ${isCurrent ? 'text-amber-400' : 'text-neutral-200'}`}>
                          {v.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
                          {v.duration ? `${v.duration} • ` : ''}{v.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer with return to study button */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between shrink-0">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              Mind refresh videos run in ad-free safe embed mode.
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              Resume Study Session
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
