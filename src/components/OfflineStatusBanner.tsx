import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, Sparkles, Zap, ChevronRight, X } from 'lucide-react';
import { hapticClick } from '../lib/haptics';

interface OfflineStatusBannerProps {
  onOpenOfflineHub: () => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusBannerProps> = ({ onOpenOfflineHub }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedBanner) {
    return null;
  }

  if (dismissed && !isOnline) {
    return (
      <button
        onClick={() => {
          hapticClick();
          onOpenOfflineHub();
        }}
        className="fixed bottom-[calc(9.25rem+env(safe-area-inset-bottom))] right-4 sm:bottom-24 z-[800] p-2.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs shadow-xl flex items-center gap-1.5 animate-bounce border border-amber-300 active:scale-95"
        title="Offline Mode Active"
      >
        <WifiOff size={16} />
        <span className="hidden sm:inline">Offline Hub</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {!isOnline && !dismissed && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-2 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[950]"
        >
          <div className="p-3.5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <WifiOff size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Offline Mode</span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[9px] font-mono font-bold">PWA CORE</span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Flashcards, Baby Learn, & Arena are ready offline.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  hapticClick();
                  onOpenOfflineHub();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center gap-1"
              >
                Activities
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  hapticClick();
                  setDismissed(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                title="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showReconnectedBanner && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-2 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[950]"
        >
          <div className="p-3.5 rounded-2xl bg-slate-950/95 border-2 border-emerald-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Wifi size={18} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400">Back Online</div>
              <p className="text-[11px] text-slate-300">
                Neural Cloud sync & AI services reconnected.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
