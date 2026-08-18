import React, { useState } from 'react';
import { VideoShelf } from './VideoShelf';
import { StudyPlaylistGenerator } from './StudyPlaylistGenerator';
import { MindRefreshModal } from './MindRefreshModal';
import { 
  ChevronLeft, 
  Sparkles, 
  ListVideo, 
  Baby, 
  GraduationCap, 
  Coffee, 
  Tv, 
  Compass, 
  Search, 
  PlaySquare, 
  ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideosHubProps {
  age?: 'baby' | 'kid' | 'teen' | 'adult';
  onBack: () => void;
}

export default function VideosHub({ age = 'kid', onBack }: VideosHubProps) {
  const [activeTab, setActiveTab] = useState<'kids' | 'playlists' | 'refresh'>(
    age === 'baby' ? 'kids' : 'playlists'
  );
  const [selectedAge, setSelectedAge] = useState<'baby' | 'kid'>(
    age === 'baby' ? 'baby' : 'kid'
  );
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-3 sm:p-6 pb-32 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-app-card border border-app-border text-app-text hover:border-app-accent transition-all hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500 font-black text-xs flex items-center gap-1">
                <PlaySquare size={14} /> Video Learning Studio
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center gap-1">
                <ShieldCheck size={14} /> SafeSearch Protected
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-app-text mt-1">
              Learning Videos & Study Playlists
            </h1>
            <p className="text-xs text-app-text-muted mt-0.5">
              Live YouTube-powered video search, AI syllabi, and distraction-free break rooms.
            </p>
          </div>
        </div>

        {/* Mind Refresh Quick Launch */}
        <button
          onClick={() => setIsBreakModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Coffee size={16} /> Free Mind Refresh Break
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-app-card border border-app-border rounded-2xl mb-5 max-w-xl">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'playlists'
              ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20'
              : 'text-app-text-muted hover:text-app-text'
          }`}
        >
          <ListVideo size={16} /> Study Playlists & AI
        </button>
        <button
          onClick={() => setActiveTab('kids')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'kids'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-app-text-muted hover:text-app-text'
          }`}
        >
          <Baby size={16} /> Baby & Kids Mode
        </button>
      </div>

      {/* Tab 1: AI Study Playlist Generator */}
      {activeTab === 'playlists' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <StudyPlaylistGenerator initialTopic="Quantum Physics & General Relativity" />
        </motion.div>
      )}

      {/* Tab 2: Baby and Kids Learning Videos */}
      {activeTab === 'kids' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Age switch: Baby vs Kids */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-app-text-muted uppercase tracking-wider">Age Group:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAge('baby')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedAge === 'baby'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-app-card border border-app-border text-app-text-muted'
                }`}
              >
                👶 Baby (0 - 3 yrs)
              </button>
              <button
                onClick={() => setSelectedAge('kid')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedAge === 'kid'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-app-card border border-app-border text-app-text-muted'
                }`}
              >
                🧒 Kids (4 - 12 yrs)
              </button>
            </div>
          </div>

          <VideoShelf age={selectedAge} />
        </motion.div>
      )}

      {/* Mind Refresh Break Modal */}
      <MindRefreshModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
      />
    </div>
  );
}
