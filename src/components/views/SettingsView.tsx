import React, { useState, useEffect } from 'react';
import { ChevronLeft, Palette, ArrowRight, FileText, CheckCircle2, Baby, Users, Clock, Volume2, Lock as LockIcon, LogOut, Zap, Download, ShieldCheck, Gauge, Play, Square, QrCode } from 'lucide-react';
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
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);

  useEffect(() => {
    setSpeechRate(getStoredSpeechRate());
  }, []);

  const updateProfile = async (updated: UserProfile) => {
    hapticClick(); setUserProfile(updated); localStorage.setItem('userProfile', JSON.stringify(updated));
    try { await DataService.updateUserProfile(updated); } catch (error) { console.error('Profile sync failed:', error); }
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    setStoredSpeechRate(newRate);
  };

  const handleTestVoice = () => {
    if (isPlayingTestVoice) {
      stopAiVoice();
      setIsPlayingTestVoice(false);
      return;
    }

    setIsPlayingTestVoice(true);
    playAiVoice(
      `Hello! This is a preview of my conversational voice playback at ${speechRate.toFixed(2)} speed multiplier.`,
      'Zephyr',
      () => setIsPlayingTestVoice(true),
      () => setIsPlayingTestVoice(false),
      speechRate
    );
  };

  return (
    <div className="p-6 pt-[calc(1.5rem+var(--safe-top))] pb-32 sm:pb-40">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => { hapticClick(); setView('home'); }} className="p-2 -ml-2 text-app-text">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-app-text">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Admin Inspection Console Entry */}
        <button 
          onClick={() => {
            hapticClick();
            setView('admin-inspection');
          }}
          className="w-full p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <div className="font-black text-white flex items-center gap-2 text-sm">
                Admin Inspection Console
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] uppercase tracking-wider font-bold">SYSTEM</span>
              </div>
              <div className="text-xs text-slate-400">Manage apps, feature switches & C++ kernel telemetry</div>
            </div>
          </div>
          <ArrowRight size={20} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => { hapticClick(); setIsThemePickerOpen(true); }}
          className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Palette size={20} />
            </div>
            <div className="text-left">
              <div className="font-bold text-app-text">App Theme</div>
              <div className="text-xs text-app-text-muted capitalize">
                {theme === 'black' ? 'Pure OLED (Pitch Black #000000)' : theme === 'midnight' ? 'Midnight Slate (Deep Dark)' : 'Minimalist Light (Clean Canvas)'}
              </div>
            </div>
          </div>
          <ArrowRight size={20} className="text-app-text-muted" />
        </button>

        <div className="p-5 rounded-3xl bg-app-card border border-app-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <div className="font-bold text-app-text">Text Size</div>
          </div>
          <div className="flex gap-2">
            {(['small', 'normal', 'large'] as const).map(size => (
              <button key={size} onClick={() => setTextSize(size)} className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${textSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-app-bg text-app-text border-app-border'}`}>
                {size[0].toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { const next = !notificationsEnabled; setNotificationsEnabled(next); localStorage.setItem('studysnap-notifications', String(next)); }} className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={20} /></div>
            <div className="text-left"><div className="font-bold text-app-text">Notifications</div><div className="text-xs text-app-text-muted">{notificationsEnabled ? 'Alerts are enabled' : 'Alerts are paused'}</div></div>
          </div>
          <div className={`w-12 h-6 rounded-full relative ${notificationsEnabled ? 'bg-indigo-600' : 'bg-app-border'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`} /></div>
        </button>

        {/* Age Group Section */}
        <div className="p-5 rounded-3xl bg-app-card border border-app-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Baby size={20} />
            </div>
            <div className="font-bold text-app-text">Age Group Mode</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['baby', 'kid', 'teen', 'adult'] as AgeGroup[]).map(age => {
              const rank = { baby: 0, kid: 1, teen: 2, adult: 3 } as const;
              const currentRank = userProfile ? rank[userProfile.age_group] : 3;
              const canSelect = rank[age] <= currentRank || userProfile?.role === 'admin';
              return (
                <button
                  key={age}
                  disabled={!canSelect}
                  onClick={() => {
                    if (userProfile && canSelect) {
                      const updated = { ...userProfile, age_group: age };
                      updateProfile(updated);
                      if (age === 'baby') setView('early-learning');
                    }
                  }}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-all capitalize ${
                    userProfile?.age_group === age
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : canSelect
                        ? 'bg-app-bg text-app-text border-app-border'
                        : 'bg-app-bg/40 text-app-text-muted/40 border-app-border/40 cursor-not-allowed'
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Section */}
        <div className="p-5 rounded-3xl bg-app-card border border-app-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <div className="font-bold text-app-text">User Role</div>
              <p className="text-xs text-app-text-muted mt-1">Role changes are admin-verified. Your current role controls feature access.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-app-bg border border-app-border">
            <div className="text-sm font-black text-app-text capitalize">{userProfile?.role?.replace('_', ' ')}</div>
            {userProfile?.requested_role && <div className="text-xs text-app-accent font-bold mt-1">Requested: {userProfile.requested_role.replace('_', ' ')}</div>}
            <p className="text-xs text-app-text-muted mt-2">Contact an institution/platform administrator to change a privileged role.</p>
          </div>
        </div>

        {/* Parental Controls Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-xs font-bold text-app-text-muted uppercase tracking-widest px-2 mb-4">Parental Controls</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-app-card border border-app-border">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock size={20} />
                </div>
                <div className="font-bold text-app-text">Screen Time Limit</div>
              </div>
              <div className="flex gap-2">
                {[0, 15, 30, 60].map(limit => (
                  <button 
                    key={limit} 
                    onClick={() => {
                      if (userProfile) {
                        updateProfile({ ...userProfile, screen_time_limit: limit });
                      }
                    }}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${
                      userProfile?.screen_time_limit === limit 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-app-bg text-app-text border-app-border'
                    }`}
                  >
                    {limit === 0 ? 'Off' : `${limit}m`}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (userProfile) {
                  updateProfile({ ...userProfile, sound_enabled: !userProfile.sound_enabled });
                }
              }}
              className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Volume2 size={20} />
                </div>
                <div className="font-bold text-app-text">Sound Effects</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${userProfile?.sound_enabled ? 'bg-indigo-600' : 'bg-app-border'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userProfile?.sound_enabled ? 'right-1' : 'left-1'}`} />
              </div>
            </button>

            {/* AI Speech Voice Rate Controls */}
            <div className="p-5 rounded-3xl bg-app-card border border-app-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-app-text">AI Voice Speed</div>
                    <div className="text-xs text-app-text-muted">Narration & tutor playback rate</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {speechRate.toFixed(2)}x
                </span>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="0.75"
                  max="2.0"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-app-text-muted font-bold mt-1">
                  <span>0.75x (Relaxed)</span>
                  <span>1.0x (Normal)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* Presets & Test */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-1">
                  {[0.85, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        Math.abs(speechRate - rate) < 0.03
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-app-bg text-app-text border-app-border hover:border-indigo-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTestVoice}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPlayingTestVoice
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  {isPlayingTestVoice ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  {isPlayingTestVoice ? 'Stop' : 'Test'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                if (userProfile) {
                  updateProfile({ ...userProfile, parental_lock: !userProfile.parental_lock });
                }
              }}
              className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <LockIcon size={20} />
                </div>
                <div className="font-bold text-app-text">Parental Lock</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${userProfile?.parental_lock ? 'bg-indigo-600' : 'bg-app-border'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userProfile?.parental_lock ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Application Deployment & Mobile Connect Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-xs font-bold text-app-text-muted uppercase tracking-widest px-2 mb-4">PWA & Mobile Connect</h2>
          <div className="space-y-3">
            {/* Mobile QR Code Action Button */}
            {onOpenQR && (
              <button 
                onClick={() => {
                  hapticClick();
                  onOpenQR();
                }}
                className="w-full p-5 rounded-3xl bg-app-card border-2 border-cyan-500/40 flex items-center justify-between group active:scale-[0.98] transition-all shadow-md hover:border-cyan-400"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-app-text flex items-center gap-2">
                      Scan Mobile QR Code
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Live App</span>
                    </div>
                    <div className="text-xs text-app-text-muted">Display high-contrast QR code for instant camera scan</div>
                  </div>
                </div>
                <ArrowRight size={20} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {isStandalone ? (
              <div className="p-5 rounded-3xl bg-app-card border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-app-text flex items-center gap-2">
                      StudySnap Native App
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Installed</span>
                    </div>
                    <div className="text-xs text-app-text-muted">Offline service worker & local cache operational</div>
                  </div>
                </div>
              </div>
            ) : isIOS ? (
              <div className="p-5 rounded-3xl bg-app-card border border-app-border space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-app-accent/10 flex items-center justify-center text-app-accent">
                    <Download size={20} />
                  </div>
                  <div className="font-bold text-app-text">iOS Installation Required</div>
                </div>
                <div className="text-xs text-app-text-muted leading-loose">
                  1. Tap the <span className="text-app-text font-bold">Share</span> icon below.<br />
                  2. Scroll down and tap <span className="text-app-text font-bold">"Add to Home Screen"</span>.
                </div>
              </div>
            ) : canInstall ? (
              <button 
                onClick={() => {
                  hapticClick();
                  onInstallApp?.();
                }}
                className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-app-accent/10 flex items-center justify-center text-app-accent">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-app-text">Install StudySnap PRO</div>
                    <div className="text-xs text-app-text-muted">Deploy neural node for native & offline experience</div>
                  </div>
                </div>
                <ArrowRight size={20} className="text-app-text-muted group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="p-5 rounded-3xl bg-app-card border border-app-border opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-app-accent/10 flex items-center justify-center text-app-accent">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-app-text text-xs">PWA Ready</div>
                    <div className="text-[11px] text-app-text-muted">Use "Install App" or "Add to Home Screen" in your browser menu.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Neural Architecture Section */}
        <div className="mt-8 mb-4">
          <h2 className="text-xs font-bold text-app-text-muted uppercase tracking-widest px-2 mb-4">Neural Architecture</h2>
          <div className="space-y-4">
            <button 
              onClick={() => {
                hapticClick();
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full p-5 rounded-3xl bg-app-card border border-app-border flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-app-text">Purge Neural Cache</div>
                  <div className="text-xs text-app-text-muted">Reset all local storage buffers</div>
                </div>
              </div>
              <ArrowRight size={20} className="text-app-text-muted group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-app-accent">
                    <Palette size={20} />
                  </div>
                  <div className="font-bold text-white uppercase tracking-wider text-xs">Kernel Status</div>
                </div>
                <div className="px-2 py-1 bg-app-accent/10 border border-app-accent/20 rounded-md text-[8px] text-app-accent font-black uppercase">Active</div>
              </div>
              <div className="font-mono text-[10px] text-zinc-500 space-y-1">
                <div>{">"} LOADED: SCR_WORKER_0.1.0</div>
                <div>{">"} STATUS: OPTIMIZED_L3</div>
                <div>{">"} ENGINE: RUST_WASM_SIM_v2</div>
                <div className="pt-2 opacity-50 truncate">
                  {">"} HASH: {NeuralEngine.stringToBinary(userProfile?.user_name || 'GUEST').substring(0, 32)}...
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            hapticClick();
            handleLogout();
          }}
          className="w-full p-5 mt-8 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center gap-3 text-rose-600 font-black hover:bg-rose-100 transition-all active:scale-[0.98]"
        >
          <LogOut size={20} />
          Safe Disconnect
        </button>
      </div>
    </div>
  );
};
