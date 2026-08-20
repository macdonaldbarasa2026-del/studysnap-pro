import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Palette, ArrowRight, FileText, CheckCircle2, Baby, Users, Clock, Volume2, Lock as LockIcon, LogOut, Zap, Download, ShieldCheck, Gauge, Play, Square, QrCode, Settings, Star, Video, Calendar, Bell, HelpCircle } from 'lucide-react';
import { AgeGroup, UserProfile, Theme } from '../../types';
import { hapticClick } from '../../lib/haptics';
import { NeuralEngine } from '../../lib/neural_engine';
import { DataService } from '../../services/dataService';
import { getStoredSpeechRate, setStoredSpeechRate, playAiVoice, stopAiVoice } from '../../lib/speech';

interface SettingsViewProps {
  setView: (view: any) => void;
  setIsThemePickerOpen: (open: boolean) => void;
  theme: Theme;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  handleLogout: () => void;
  onInstallApp?: () => void;
  onOpenQR?: () => void;
  canInstall?: boolean;
  isStandalone?: boolean;
  isIOS?: boolean;
  textSize: 'small' | 'normal' | 'large';
  setTextSize: (size: 'small' | 'normal' | 'large') => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}



























































































































































































































































































































































































































































































export const SettingsView: React.FC<SettingsViewProps> = ({ 
  setView, 
  setIsThemePickerOpen, 
  theme,
  userProfile,
  setUserProfile,
  handleLogout,
  onInstallApp,
  onOpenQR,
  canInstall,
  isStandalone,
  isIOS,
  textSize,
  setTextSize,
  notificationsEnabled,
  setNotificationsEnabled
}) => {
  return (
    <div className="feature-workspace flex flex-col min-h-[100dvh] bg-app-bg pb-[var(--safe-bottom)]">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="text-app-text">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-app-text">Menu</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setIsThemePickerOpen(true)} className="rounded-xl p-2 text-app-text hover:bg-app-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent" aria-label="Change appearance">
              <Settings size={24} />
           </button>
        </div>
      </header>

      <main className="feature-workspace-scroll flex-1">
        {/* Profile Header */}
        <div className="p-4 flex items-center justify-between">
           <button onClick={() => setView('academic-profile')} className="flex items-center gap-4 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
              <div className="w-16 h-16 rounded-full bg-app-accent flex items-center justify-center text-white text-2xl font-bold">
                 {(userProfile?.user_name || 'S').slice(0, 1).toUpperCase()}
              </div>
              <div>
                 <h2 className="text-lg font-bold text-app-text">{userProfile?.user_name}</h2>
                 <p className="text-sm text-app-text-muted">View profile</p>
              </div>
           </button>
           <button onClick={() => setView('academic-profile')} className="rounded-xl p-2 text-app-text-muted hover:bg-app-bg" aria-label="Open profile"><ChevronRight size={20} /></button>
        </div>

        {/* Action Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
           <SettingsAction icon={<Clock className="text-blue-500" />} label="Recent" onClick={() => setView('recent')} />
           <SettingsAction icon={<Star className="text-amber-500" />} label="Saved" onClick={() => setView('favorites')} />
           <SettingsAction icon={<Users className="text-indigo-500" />} label="Groups" onClick={() => setView('communities')} />
           <SettingsAction icon={<Video className="text-rose-500" />} label="Reels" onClick={() => setView('videos')} />
           <SettingsAction icon={<Calendar className="text-red-500" />} label="Events" onClick={() => setView('events')} />
           <SettingsAction icon={<ShieldCheck className="text-emerald-500" />} label="Safety" onClick={() => setView('policies')} />
        </div>

        <div className="mt-4 border-t border-app-border">
           <SettingsRow icon={<Palette size={20} />} label="Appearance" onClick={() => setIsThemePickerOpen(true)} />
           <SettingsRow icon={<Bell size={20} />} label={notificationsEnabled ? 'Study reminders on' : 'Study reminders off'} onClick={() => setNotificationsEnabled(!notificationsEnabled)} />
           <SettingsRow icon={<LockIcon size={20} />} label="Privacy & safety" onClick={() => setView('policies')} />
           <SettingsRow icon={<HelpCircle size={20} />} label="Help & Support" onClick={() => setView('help')} />
        </div>

        <div className="p-4 mt-4">
           <button 
             onClick={handleLogout}
             className="w-full py-3 rounded-xl bg-app-bg border border-app-border text-red-500 font-bold active:bg-red-50"
           >
             Log Out
           </button>
        </div>
      </main>
    </div>
  );
};

const SettingsAction = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="bg-app-card p-4 rounded-xl border border-app-border flex flex-col gap-2 active:bg-app-bg">
    {icon}
    <span className="text-sm font-bold text-app-text">{label}</span>
  </button>
);

const SettingsRow = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full p-4 flex items-center justify-between active:bg-app-bg">
    <div className="flex items-center gap-4 text-app-text">
       {icon}
       <span className="text-sm font-medium">{label}</span>
    </div>
    <ChevronRight size={18} className="text-app-text-muted" />
  </button>
);
