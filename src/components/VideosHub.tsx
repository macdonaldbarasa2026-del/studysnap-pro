import React from 'react';
import { VideoShelf } from './VideoShelf';
import { 
  ChevronLeft,
  Camera
} from 'lucide-react';

interface VideosHubProps {
  age?: 'baby' | 'kid' | 'teen' | 'adult';
  onBack: () => void;
  onCreate: () => void;
}

export default function VideosHub({ age = 'kid', onBack, onCreate }: VideosHubProps) {

  return (
    <div className="feature-workspace flex flex-col min-h-[100dvh] bg-app-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-app-text">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold font-serif italic text-app-text">Reels</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onCreate} className="rounded-xl p-2 text-app-text hover:bg-app-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent" aria-label="Scan a note">
              <Camera size={22} />
           </button>
        </div>
      </header>

      <main className="feature-workspace-scroll flex-1 snap-y snap-mandatory pb-[var(--safe-bottom)]">
        <div className="h-full">
           <VideoShelf age={age} className="h-full border-0 rounded-0" />
        </div>
      </main>
    </div>
  );
}
