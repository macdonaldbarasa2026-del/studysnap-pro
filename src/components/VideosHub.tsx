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
  const [activeTab, setActiveTab] = useState<'kids' | 'playlists' | 'refresh'>('kids');

  return (
    <div className="flex flex-col h-screen bg-app-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-app-text">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold font-serif italic text-app-text">Reels</h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="text-app-text">
              <CameraIcon size={24} />
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto snap-y snap-mandatory pb-[var(--safe-bottom)]">
        <div className="h-full">
           <VideoShelf age="kid" className="h-full border-0 rounded-0" />
        </div>
      </main>
    </div>
  );
}
