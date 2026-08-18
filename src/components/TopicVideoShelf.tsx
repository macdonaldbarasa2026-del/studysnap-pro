import React, { useState, useEffect } from 'react';
import { PlayCircle, Video, RefreshCw, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { YouTubeVideo, searchYouTubeEducational } from '../services/youtube';
import { VideoPlayerModal } from './VideoPlayerModal';

interface TopicVideoShelfProps {
  topic: string;
  category?: string;
  onSaveNote?: (note: string) => void;
  className?: string;
}

export const TopicVideoShelf: React.FC<TopicVideoShelfProps> = ({ topic, category, onSaveNote, className = '' }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);

  const fetchTopicVideos = async () => {
    if (!topic || topic.trim().length === 0) return;
    setLoading(true);
    try {
      const results = await searchYouTubeEducational(topic, 'teen', 4);
      setVideos(results);
    } catch (err) {
      console.error('Failed to load topic videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicVideos();
  }, [topic]);

  if (!topic) return null;

  return (
    <div className={`rounded-3xl border border-app-border bg-app-card p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <Video size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-app-text flex items-center gap-2">
              Topic Video Explanations
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                YouTube
              </span>
            </h3>
            <p className="text-xs text-app-text-muted">Top visual lessons for "{topic}"</p>
          </div>
        </div>

        <button
          onClick={fetchTopicVideos}
          disabled={loading}
          className="p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Refresh video suggestions"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-app-text-muted">
          <RefreshCw size={14} className="animate-spin text-amber-500" /> Finding best visual lectures...
        </div>
      ) : videos.length === 0 ? (
        <div className="py-6 text-center text-xs text-app-text-muted">
          No video lessons found for this topic yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {videos.map((v) => (
            <button
              key={v.videoId}
              onClick={() => setActiveVideo(v)}
              className="group text-left rounded-2xl border border-app-border bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-amber-400/50 overflow-hidden transition-all flex flex-col"
            >
              <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="p-3 rounded-full bg-white/90 text-amber-600 shadow-lg transform group-hover:scale-110 transition-transform">
                    <PlayCircle size={22} />
                  </div>
                </div>
                {v.duration && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white rounded text-[10px] font-mono">
                    {v.duration}
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-app-text line-clamp-2 leading-snug">
                  {v.title}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-app-text-muted">
                  <span className="truncate max-w-[150px]">{v.channelTitle}</span>
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    Watch <ExternalLink size={10} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Embed Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onTakeNote={onSaveNote}
        />
      )}
    </div>
  );
};
