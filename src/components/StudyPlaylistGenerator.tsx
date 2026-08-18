import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ListOrdered, 
  PlayCircle, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudyPlaylist, StudyPlaylistModule, generateStudyPlaylist, YouTubeVideo } from '../services/youtube';
import { VideoPlayerModal } from './VideoPlayerModal';

interface StudyPlaylistGeneratorProps {
  initialTopic?: string;
  onClose?: () => void;
  onSavePlaylist?: (playlist: StudyPlaylist) => void;
}

export const StudyPlaylistGenerator: React.FC<StudyPlaylistGeneratorProps> = ({
  initialTopic = '',
  onClose,
  onSavePlaylist
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState<StudyPlaylist | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [error, setError] = useState('');

  const sampleTopics = [
    'Calculus: Derivatives & Integrals',
    'Machine Learning & Transformers',
    'Cellular Biology & Genetics',
    'Organic Chemistry Mechanisms',
    'World War II History',
    'Python Data Structures'
  ];

  const handleGenerate = async (targetTopic: string = topic) => {
    if (!targetTopic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateStudyPlaylist(targetTopic.trim(), difficulty);
      setPlaylist(result);
      setCompletedSteps({});
      setExpandedStep(1);
      if (onSavePlaylist) onSavePlaylist(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompleted = (step: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const totalSteps = playlist?.modules.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-neutral-900 to-neutral-900 border border-indigo-500/20 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> AI Study Playlist Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Structured Course Playlists</h2>
            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-xl">
              Turn any syllabus or learning goal into an organized, step-by-step video curriculum with curated YouTube lectures and concept checklists.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Input & Difficulty */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Enter subject or topic (e.g., Photosynthesis, Linear Algebra)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={difficulty}
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="px-3.5 py-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Building...' : 'Generate Playlist'}
            </button>
          </div>
        </div>

        {/* Topic Quick Chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Quick Ideas:</span>
          {sampleTopics.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                handleGenerate(t);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-700/80 border border-neutral-700/60 text-[11px] text-neutral-300 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Playlist Content */}
      {playlist && (
        <div className="space-y-6">
          {/* Overview & Progress Bar */}
          <div className="p-6 rounded-3xl bg-app-card border border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-app-text">{playlist.topic}</h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase">
                  {playlist.difficulty}
                </span>
              </div>
              <p className="text-xs text-app-text-muted">{playlist.overview}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-app-text-muted">
                <Clock size={15} /> ~{playlist.estimatedHours} hrs
              </div>

              {/* Progress pill */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-600">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-3.5">
            {playlist.modules.map((mod) => {
              const isDone = Boolean(completedSteps[mod.step]);
              const isExpanded = expandedStep === mod.step;

              return (
                <div
                  key={mod.step}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isDone 
                      ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-app-border bg-app-card'
                  }`}
                >
                  {/* Step Header Bar */}
                  <div
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedStep(isExpanded ? null : mod.step)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompleted(mod.step);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
                          isDone ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={22} className="fill-emerald-100 dark:fill-emerald-950" /> : <Circle size={22} />}
                      </button>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Step {mod.step}
                          </span>
                          <h4 className={`font-bold text-sm sm:text-base text-app-text truncate ${isDone ? 'line-through text-app-text-muted' : ''}`}>
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-xs text-app-text-muted truncate mt-0.5">{mod.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {mod.video && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideo(mod.video);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                        >
                          <PlayCircle size={15} /> Watch
                        </button>
                      )}
                      <div className="text-neutral-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Step Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-app-border space-y-4"
                      >
                        {/* Key concepts */}
                        {mod.keyConcepts && mod.keyConcepts.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-app-text-muted">
                              Key Concepts:
                            </span>
                            <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {mod.keyConcepts.map((kc, i) => (
                                <li key={i} className="text-xs text-app-text flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                  {kc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Video Card */}
                        {mod.video && (
                          <div 
                            onClick={() => setActiveVideo(mod.video)}
                            className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-indigo-400 transition-colors"
                          >
                            <div className="relative aspect-video w-full sm:w-48 bg-black rounded-xl overflow-hidden shrink-0">
                              <img src={mod.video.thumbnail} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <PlayCircle size={24} className="text-white" />
                              </div>
                            </div>

                            <div className="flex-1 overflow-hidden w-full">
                              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                Recommended Lecture
                              </div>
                              <h5 className="font-bold text-xs sm:text-sm text-app-text line-clamp-1 mt-0.5">
                                {mod.video.title}
                              </h5>
                              <p className="text-[11px] text-app-text-muted line-clamp-2 mt-1">
                                {mod.video.description || mod.video.channelTitle}
                              </p>
                              <div className="mt-2 text-[10px] font-semibold text-app-text-muted">
                                Channel: {mod.video.channelTitle}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
};
