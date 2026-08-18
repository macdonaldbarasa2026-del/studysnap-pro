import React, { useEffect, useState } from 'react';
import { PlayCircle, RefreshCw, ShieldCheck, ExternalLink, Sparkles, Search, Music, HelpCircle, Star, Heart, Volume2 } from 'lucide-react';
import { YouTubeVideo, getLearningVideos } from '../services/youtube';
import { VideoPlayerModal } from './VideoPlayerModal';

type Age = 'baby' | 'kid' | 'teen' | 'adult';

interface VideoShelfProps {
  age: Age;
  topic?: string;
  className?: string;
}

export const VideoShelf: React.FC<VideoShelfProps> = ({ age, topic = '', className = '' }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTopic, setSearchTopic] = useState(topic);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const babyCategories = [
    { label: 'All', query: '' },
    { label: 'Songs & Rhymes', query: 'nursery rhymes songs for babies' },
    { label: 'Colors & Shapes', query: 'learn colors and shapes for toddlers' },
    { label: 'Counting 123', query: 'counting numbers 1 to 10 for toddlers' },
    { label: 'Animal Sounds', query: 'animal sounds fun for babies' },
  ];

  const kidCategories = [
    { label: 'All', query: '' },
    { label: 'Science Lab', query: 'science experiments and facts for kids' },
    { label: 'Space & Planets', query: 'solar system and space for kids' },
    { label: 'Fun Math', query: 'math tricks and learning for kids' },
    { label: 'Nature & Animals', query: 'animals and wildlife for kids' },
    { label: 'How It Works', query: 'how everyday things work for kids' },
  ];

  const currentCategories = age === 'baby' ? babyCategories : kidCategories;

  const load = async (queryTopic: string = searchTopic, categoryQuery: string = '') => {
    setLoading(true);
    setError('');
    try {
      const effectiveTopic = categoryQuery || queryTopic;
      const data = await getLearningVideos(age, effectiveTopic, activeCategory);
      setVideos(data || []);
      if (data && data.length > 0 && !selected) {
        // keep selected empty until clicked or auto-select
      }
    } catch (e: any) {
      setError(e.message || 'Could not load learning videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(topic);
  }, [age, topic]);

  const handleCategoryClick = (cat: { label: string; query: string }) => {
    setActiveCategory(cat.label);
    load(searchTopic, cat.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(searchTopic);
  };

  return (
    <section className={`p-4 sm:p-6 rounded-3xl bg-app-card border border-app-border shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${age === 'baby' ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600'}`}>
            {age === 'baby' ? <Heart size={22} className="fill-pink-400" /> : <Sparkles size={22} />}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {age === 'baby' ? 'Baby & Toddler Video Fun' : 'Kids Learning Video Zone'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Safe, curated educational videos with embed controls & zero ads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <ShieldCheck size={14} /> SafeSearch Active
          </div>
          <button
            onClick={() => load(searchTopic)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-sky-50 dark:bg-neutral-800 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition-colors"
            title="Refresh videos"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Child-friendly Category Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {currentCategories.map((c) => {
          const isSelected = activeCategory === c.label;
          return (
            <button
              key={c.label}
              onClick={() => handleCategoryClick(c)}
              className={`px-3 py-2.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all ${
                isSelected
                  ? age === 'baby'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Video Search input */}
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            placeholder={age === 'baby' ? 'Search songs or colors...' : 'Search animal facts, space, math...'}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-2xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors shrink-0"
        >
          Find Videos
        </button>
      </form>

      {/* Active Video Player If Selected */}
      {selected && (
        <div className="mb-6 p-4 rounded-3xl bg-slate-900 text-white shadow-xl space-y-3">
          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${selected.videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">{selected.title}</h3>
              <p className="text-xs text-slate-400">{selected.channelTitle}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors"
            >
              Close Video
            </button>
          </div>
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <RefreshCw size={24} className="animate-spin text-sky-500" />
          <span className="text-xs font-bold">Finding live educational videos...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4">
          <p className="text-sm font-bold text-rose-600 mb-1">{error}</p>
          <p className="text-xs text-slate-500">Live YouTube video service fallback active.</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs font-medium">
          No learning videos found for this search. Try selecting a category above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.map((v) => (
            <button
              key={v.videoId}
              onClick={() => setSelected(v)}
              className="group text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/60 hover:border-sky-300 transition-all flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={v.thumbnail}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="p-3 rounded-full bg-white/95 text-sky-600 shadow-xl transform group-hover:scale-110 transition-transform">
                    <PlayCircle size={22} />
                  </div>
                </div>
                {v.duration && (
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white rounded text-[10px] font-mono">
                    {v.duration}
                  </span>
                )}
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                    {v.channelTitle}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  <span className="flex items-center gap-1">
                    <PlayCircle size={13} /> Watch in Safe Mode
                  </span>
                  {v.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      {v.category}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
