import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Zap, Book, MessageSquare, Settings, User, Sparkles, X, ChevronRight, Beaker, ShieldCheck, QrCode } from 'lucide-react';
import { View } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  onOpenQR?: () => void;
  userName: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onOpenQR, userName }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { id: 'home', title: 'Go Home', icon: Book, view: 'home' as View, shortcut: 'H' },
    { id: 'studysnap-ai', title: 'StudySnap AI', icon: Sparkles, view: 'studysnap-ai' as View, shortcut: 'G' },
    { id: 'admin', title: 'Admin Inspection Console', icon: ShieldCheck, view: 'admin-inspection' as View, shortcut: 'I' },
    { id: 'mobile-qr', title: 'Scan Mobile QR Code', icon: QrCode, action: onOpenQR, shortcut: 'Q' },
    { id: 'bites', title: 'Study Bites', icon: Zap, view: 'bites' as View, shortcut: 'B' },
    { id: 'alchemy', title: 'Knowledge Alchemy', icon: Beaker, view: 'alchemy' as View, shortcut: 'A' },
    { id: 'twin', title: 'AI Study Twin', icon: Sparkles, view: 'ai-study-twin' as View, shortcut: 'T' },
    { id: 'classroom', title: 'Live Classroom', icon: MessageSquare, view: 'live-classroom' as View, shortcut: 'L' },
    { id: 'profile', title: 'My Profile', icon: User, view: 'academic-profile' as View, shortcut: 'P' },
    { id: 'settings', title: 'Settings', icon: Settings, view: 'settings' as View, shortcut: 'S' },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Prevent shortcuts if typing in input, except for Arrow keys and Enter
      const isTyping = document.activeElement === inputRef.current;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          if (action.action) {
            action.action();
          } else if (action.view) {
            onNavigate(action.view);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (!isTyping) {
        // Handle letter shortcuts only when not typing
        const key = e.key.toUpperCase();
        const action = actions.find(a => a.shortcut === key);
        if (action) {
          e.preventDefault();
          if (action.action) {
            action.action();
          } else if (action.view) {
            onNavigate(action.view);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[800] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 bg-black/45 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="w-full max-w-2xl bg-app-card border border-app-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-app-border flex items-center gap-3 bg-app-card">
          <div className="w-9 h-9 rounded-xl bg-app-accent-soft text-app-accent grid place-items-center shrink-0"><Search size={18} /></div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search StudySnap or jump to a tool…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-app-text text-base placeholder:text-app-text-muted"
          />
          <kbd className="px-2 py-1 rounded-md border border-app-border bg-app-bg text-[10px] font-mono text-app-text-muted">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 bg-app-bg space-y-1">
          {filteredActions.length > 0 ? (
            filteredActions.map((action, idx) => (
              <button
                key={action.id}
                onClick={() => {
                  if (action.action) {
                    action.action();
                  } else if (action.view) {
                    onNavigate(action.view);
                  }
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl transition-all border ${
                  idx === selectedIndex ? 'bg-app-accent-soft text-app-text border-app-accent/20' : 'text-app-text-muted border-transparent hover:bg-app-card hover:text-app-text'
                }`}
              >
                <div className="flex items-center gap-5">
                  <span className={`w-9 h-9 rounded-lg grid place-items-center ${idx === selectedIndex ? 'bg-app-accent text-white' : 'bg-app-card text-app-accent border border-app-border'}`}><action.icon size={17} /></span>
                  <span className="font-semibold text-sm">{action.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                    idx === selectedIndex ? 'bg-app-card text-app-text border-app-border' : 'bg-transparent border-app-border text-app-text-muted'
                  }`}>
                    {action.shortcut}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-app-card border border-app-border grid place-items-center text-app-text-muted"><Search size={18} /></div>
              <p className="mt-3 text-sm font-semibold text-app-text">No matching StudySnap tool</p>
              <p className="mt-1 text-xs text-app-text-muted">Try “AI”, “notes”, “flashcards”, or “settings”.</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-app-card border-t border-app-border flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 text-[10px] font-semibold text-app-text-muted">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-app-bg border border-app-border rounded text-app-text-muted">↑↓</span>
              <span>Nav</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-app-bg border border-app-border rounded text-app-text-muted">ENTER</span>
              <span>Run</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-app-text-muted">
            <Sparkles size={15} className="text-app-accent" />
            <span className="text-[10px] font-semibold">StudySnap AI workspace</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
