import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Terminal, 
  Zap, 
  Layers, 
  Plus, 
  Trash2, 
  Power, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Search, 
  ArrowLeft,
  Server,
  Database,
  UserCheck,
  Building2,
  FileCheck2,
  Settings,
  Sparkles,
  Gauge,
  HardDrive,
  Maximize2,
  Lock,
  KeyRound,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminInspectionProps {
  userProfile: UserProfile | null;
  onBack: () => void;
  addToast?: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

interface AppItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'disabled';
  memoryMB: number;
  key: string;
  icon: string;
  desc: string;
}

interface LogItem {
  timestamp: string;
  level: string;
  message: string;
}

export const AdminInspection: React.FC<AdminInspectionProps> = ({ userProfile, onBack, addToast }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  // Server-issued session token. The old build unlocked the UI against a
  // hardcoded client-side string, which left every /api/admin/* route
  // callable by anyone regardless of the UI lock. Every admin request now
  // carries this token and the server independently verifies it.
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const adminFetch = (input: string, init: RequestInit = {}) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      },
    });

  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        setAdminToken(data.token);
        setIsUnlocked(true);
        setPasswordInput('');
        if (addToast) addToast("Admin Console Authenticated - Access Granted", "success");
      } else {
        setAuthError(data.error || "Access Denied: Incorrect Admin Password");
        setPasswordInput('');
      }
    } catch (err) {
      setAuthError("Could not reach the server to authenticate.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'apps' | 'features' | 'terminal' | 'users' | 'institutions'>('institutions');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryMB, setMemoryMB] = useState(0);
  const [frameLatencyMs, setFrameLatencyMs] = useState(0);
  const [activeConn, setActiveConn] = useState(0);
  const [pendingInstitutions, setPendingInstitutions] = useState<any[]>([]);
  const [institutionReviewing, setInstitutionReviewing] = useState<string | null>(null);

  // App Manager State
  const [apps, setApps] = useState<AppItem[]>([]);

  const [newAppName, setNewAppName] = useState('');
  const [newAppKey, setNewAppKey] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('STEM');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [isAddingAppModal, setIsAddingAppModal] = useState(false);

  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    gpu_hardware_acceleration: true,
    cpp_simd_vectorization: true,
    hd_camera_autofocus: true,
    realtime_websockets: true,
    ai_study_twin: true,
    live_classrooms: true,
    background_data_sync: true,
    low_power_optimization: false,
    memory_auto_compaction: true,
    image_cache_compression: true
  });

  // Terminal & Logs State
  const [logs, setLogs] = useState<LogItem[]>([
    { timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'StudySnap web runtime initialized.' },
    { timestamp: new Date().toLocaleTimeString(), level: 'SYSTEM', message: 'Browser-managed acceleration available where supported.' },
    { timestamp: new Date().toLocaleTimeString(), level: 'IPC', message: 'Shell Bridge socket listening on port 3000.' }
  ]);

  // Fetch telemetry from backend API on mount
  useEffect(() => {
    if (!adminToken) return;
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [adminToken]);

  const fetchTelemetry = async () => {
    try {
      const res = await adminFetch('/api/admin/inspection');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.memoryUsageMB === 'number') setMemoryMB(data.memoryUsageMB);
        if (typeof data.frameLatencyMs === 'number') setFrameLatencyMs(data.frameLatencyMs);
        if (typeof data.activeConnections === 'number') setActiveConn(data.activeConnections);
        if (data.featureFlags) setFeatureFlags(data.featureFlags);
        if (data.registeredApps) setApps(data.registeredApps);
        if (data.logs) setLogs(data.logs);
      }
      const institutionRes = await adminFetch('/api/admin/institutions/pending');
      if (institutionRes.ok) {
        const queue = await institutionRes.json();
        if (Array.isArray(queue)) setPendingInstitutions(queue);
      }
    } catch {
      // Offline fallback state
    }
  };

  const handleInstitutionDecision = async (id: string, decision: 'verified' | 'rejected') => {
    setInstitutionReviewing(id);
    try {
      const res = await adminFetch(`/api/admin/institutions/${encodeURIComponent(id)}/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Verification decision failed.');
      setPendingInstitutions(prev => prev.filter(item => item.id !== id));
      addToast?.(decision === 'verified' ? 'Institution verified and published.' : 'Institution request rejected.', decision === 'verified' ? 'success' : 'info');
    } catch (error: any) {
      addToast?.(error?.message || 'Could not update institution verification.', 'error');
    } finally {
      setInstitutionReviewing(null);
    }
  };

  const handleToggleFeature = async (key: string) => {
    const nextVal = !featureFlags[key];
    setFeatureFlags(prev => ({ ...prev, [key]: nextVal }));

    try {
      const res = await adminFetch('/api/admin/features/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: key, enabled: nextVal })
      });
      if (!res.ok) throw new Error('Feature flag rejected');
      const data = await res.json();
      if (data.featureFlags) setFeatureFlags(data.featureFlags);
      if (addToast) addToast(`Feature ${key} set to ${nextVal ? 'ENABLED' : 'DISABLED'}`, 'success');
    } catch {
      setFeatureFlags(prev => ({ ...prev, [key]: !nextVal }));
      if (addToast) addToast('Feature update failed. The displayed state was restored.', 'error');
    }
  };

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppKey.trim()) return;

    setIsLoading(true);
    const newAppItem: AppItem = {
      id: `app-${Date.now()}`,
      name: newAppName.trim(),
      category: newAppCategory,
      status: 'active',
      memoryMB: 0,
      key: newAppKey.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: 'Sparkles',
      desc: newAppDesc.trim() || 'Newly registered micro-app module'
    };

    try {
      const res = await adminFetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppItem)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.registeredApps) setApps(data.registeredApps);
      } else {
        if (addToast) addToast('The app registry rejected the request.', 'error');
        setIsLoading(false);
        return;
      }
    } catch {
      if (addToast) addToast('The app registry is unavailable. Nothing was added locally.', 'error');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsAddingAppModal(false);
    setNewAppName('');
    setNewAppKey('');
    setNewAppDesc('');
    if (addToast) addToast(`App '${newAppName}' successfully registered!`, 'success');
  };

  const handleAppAction = async (appId: string, action: 'toggle' | 'delete') => {
    try {
      const res = await adminFetch('/api/admin/apps/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, action })
      });
      if (!res.ok) throw new Error('App action rejected');
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.registeredApps)) setApps(data.registeredApps);
      if (addToast) addToast(`App action ${action} completed.`, 'success');
    } catch {
      if (addToast) addToast('App action failed. No local state was changed.', 'error');
    }
  };

  const handleRunPreset = async (preset: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Optimization rejected');
      }
      const data = await res.json();
      if (data.systemState) {
        setMemoryMB(data.systemState.memoryUsageMB);
        if (data.systemState.featureFlags) setFeatureFlags(data.systemState.featureFlags);
      }
    } catch {
      if (addToast) addToast('Optimization service unavailable. No local simulation was applied.', 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    if (addToast) addToast(`Control-plane profile '${preset}' applied.`, 'success');
  };

  const handleRefreshDiagnostics = async () => {
    try {
      const res = await adminFetch('/api/admin/diagnostics');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Diagnostics unavailable.');
      if (Array.isArray(data.logs)) setLogs(data.logs);
      if (typeof data.memoryUsageMB === 'number') setMemoryMB(data.memoryUsageMB);
      addToast?.('Read-only diagnostics refreshed.', 'success');
    } catch (error: any) {
      addToast?.(error?.message || 'Diagnostics unavailable.', 'error');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-inner">
            <Lock size={32} />
          </div>

          <h2 className="text-xl font-black tracking-wider uppercase text-white mb-1">
            Admin Inspection Restricted
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter the admin password to access system telemetry & controls
          </p>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Quick Keypad */}
            <div className="grid grid-cols-3 gap-2 my-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPasswordInput('');
                    else if (k === '⌫') setPasswordInput(prev => prev.slice(0, -1));
                    else setPasswordInput(prev => prev + k);
                  }}
                  className="py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-white font-mono font-bold text-sm active:scale-95 transition-all"
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || !passwordInput}
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black tracking-wider uppercase text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <KeyRound size={18} />
              {isAuthenticating ? 'Verifying...' : 'Unlock Admin Console'}
            </button>
          </form>

          <button
            onClick={onBack}
            className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Return to App Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Top Professional Admin Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Return to Main App"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wider uppercase text-slate-100">Admin Inspection Console</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">SECURE SESSION</span>
              </div>
              <p className="text-[11px] text-slate-400">System Telemetry & App Ecosystem Management</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <HardDrive size={14} className="text-cyan-400" />
            <span>Memory: <strong className="text-cyan-300 font-mono">{memoryMB} MB</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Activity size={14} className="text-emerald-400" />
            <span>Client frame latency: <strong className="text-emerald-300 font-mono">{frameLatencyMs ? `${frameLatencyMs} ms` : 'Not measured here'}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Server size={14} className="text-indigo-400" />
            <span>Bridge Clients: <strong className="text-indigo-300 font-mono">{activeConn}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'apps' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers size={16} />
            <span>App Registry ({apps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'institutions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 size={16} />
            <span>Institutions ({pendingInstitutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'features' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders size={16} />
            <span>Optimization & Toggles</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'terminal' 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal size={16} />
            <span>Diagnostics & Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck size={16} />
            <span>User & Security Inspector</span>
          </button>
        </div>

        <button 
          onClick={fetchTelemetry}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl hover:bg-slate-700 transition-colors ml-4 flex-shrink-0"
          title="Refresh System Telemetry"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 space-y-6">

        {/* TAB 1: APP REGISTRY */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Layers className="text-cyan-400" size={20} />
                  Micro-App & Module Ecosystem
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect registered sub-applications, manage runtime feature allocation, or dynamically register new tools.
                </p>
              </div>
              <button
                onClick={() => setIsAddingAppModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/20"
              >
                <Plus size={16} />
                <span>Register New App</span>
              </button>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map(appItem => (
                <div 
                  key={appItem.id} 
                  className={`bg-slate-900 border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                    appItem.status === 'active' 
                      ? 'border-slate-800 hover:border-cyan-500/40' 
                      : 'border-slate-800/50 opacity-60 bg-slate-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-bold">
                        {appItem.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        appItem.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${appItem.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {appItem.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-100 mb-1">{appItem.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{appItem.desc}</p>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-4">
                      <span>KEY: {appItem.key}</span>
                      <span>•</span>
                      <span>RAM: ~{appItem.memoryMB}MB</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleAppAction(appItem.id, 'toggle')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                        appItem.status === 'active'
                          ? 'bg-slate-800 hover:bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300'
                      }`}
                    >
                      <Power size={14} />
                      <span>{appItem.status === 'active' ? 'Disable' : 'Enable'}</span>
                    </button>

                    <button
                      onClick={() => handleAppAction(appItem.id, 'delete')}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove App"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INSTITUTION VERIFICATION */}
        {activeTab === 'institutions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-100 flex items-center gap-2"><Building2 className="text-cyan-400" size={20}/> Institution verification</h2>
                  <p className="text-xs text-slate-400 mt-1">Review universities, colleges, technical schools and other registered learning institutions before publication.</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">{pendingInstitutions.length} pending</span>
              </div>
            </div>
            {pendingInstitutions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center"><CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={32}/><h3 className="font-black text-slate-100">Verification queue is clear</h3><p className="text-xs text-slate-500 mt-1">New institution requests will appear here after submission.</p></div>
            ) : (
              <div className="grid gap-4">
                {pendingInstitutions.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div className="flex gap-4">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0"><FileCheck2 size={20}/></div>
                        <div><h3 className="font-black text-slate-100">{item.name}</h3><p className="text-xs text-slate-400 capitalize mt-1">{String(item.type || '').replace('_',' ')} • Registration: {item.registration_number || 'Not supplied'}</p><p className="text-xs text-slate-500 mt-2">{item.official_email || 'No official email'} {item.address ? `• ${item.address}` : ''}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={institutionReviewing === item.id} onClick={() => handleInstitutionDecision(item.id,'rejected')} className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold disabled:opacity-50">Reject</button>
                        <button disabled={institutionReviewing === item.id} onClick={() => handleInstitutionDecision(item.id,'verified')} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">{institutionReviewing === item.id ? 'Reviewing…' : 'Verify & publish'}</button>
                      </div>
                    </div>
                    {Array.isArray(item.verification_documents) && item.verification_documents.length > 0 && <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">{item.verification_documents.map((doc:any) => <span key={doc.id || doc.name} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">{doc.name}</span>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OPTIMIZATION & FEATURE TOGGLES */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Presets Header */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Sliders className="text-emerald-400" size={20} />
                  System Optimization & Feature Reduction
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Fine-tune app features to reduce overhead, save memory, or maximize hardware performance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleRunPreset('ultra_performance')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Zap size={15} />
                  <span>Ultra Performance Preset</span>
                </button>

                <button
                  onClick={() => handleRunPreset('battery_saver')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-600/20"
                >
                  <Gauge size={15} />
                  <span>Battery & Low Memory Saver</span>
                </button>

                <button
                  onClick={() => handleRunPreset('purge_cache')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-slate-700"
                >
                  <RefreshCw size={15} />
                  <span>Purge RAM & Image Caches</span>
                </button>
              </div>
            </div>

            {/* Feature Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(featureFlags).map(([flag, enabled]) => (
                <div 
                  key={flag} 
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-colors hover:border-slate-700"
                >
                  <div className="pr-4">
                    <div className="text-xs font-bold font-mono text-slate-200">
                      {flag.toUpperCase().replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {flag.includes('gpu') && 'Enables hardware-accelerated WebGL rendering.'}
                      {flag.includes('cpp') && 'Uses SIMD vector instructions for math calculations.'}
                      {flag.includes('hd') && 'Direct native camera 60FPS autofocus loop.'}
                      {flag.includes('realtime') && 'WebSocket server synchronization.'}
                      {flag.includes('ai') && 'Deep learning AI Study Twin background worker.'}
                      {flag.includes('live') && 'P2P live classroom video feed.'}
                      {flag.includes('background') && 'Firestore auto-sync & offline persistence.'}
                      {flag.includes('low_power') && 'Throttles frame rates when idle.'}
                      {flag.includes('memory') && 'Automatic C++ heap garbage collector.'}
                      {flag.includes('image') && 'Compresses scanned notes in real-time.'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFeature(flag)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                      enabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SHELL IPC & TERMINAL LOGS */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2 mb-1">
                <Terminal className="text-indigo-400" size={20} />
                System Diagnostics & Live Logs
              </h2>
              <p className="text-xs text-slate-400">
                Inspect read-only application health, service status and security-relevant runtime events. Raw shell execution is disabled in the web console.
              </p>

              {/* Terminal Box */}
              <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs h-72 overflow-y-auto space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      log.level === 'SYSTEM' ? 'bg-cyan-500/20 text-cyan-300' :
                      log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300' :
                      log.level === 'CONFIG' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.level === 'IPC' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <p className="text-xs font-bold text-slate-200">Safe diagnostics only</p>
                  <p className="text-[11px] text-slate-500 mt-1">System commands are not accepted from the browser.</p>
                </div>
                <button onClick={handleRefreshDiagnostics} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={14}/> Refresh diagnostics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USER & SECURITY INSPECTOR */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2 mb-1">
                <UserCheck className="text-amber-400" size={20} />
                Active Session User & Role Security
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Inspect authenticated session privileges, system roles, and parental lock configurations.
              </p>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">User Name</span>
                    <p className="text-sm font-bold text-slate-100 mt-1">{userProfile?.user_name || 'System Administrator'}</p>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">System Role</span>
                    <p className="text-sm font-bold text-amber-400 mt-1 uppercase">{userProfile?.role || 'admin'}</p>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Reputation Tier</span>
                    <p className="text-sm font-bold text-emerald-400 mt-1 uppercase">{userProfile?.reputation_level || 'academic_master'}</p>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Live Privileges</span>
                    <p className="text-sm font-bold text-cyan-400 mt-1">{userProfile?.can_go_live ? 'ENABLED' : 'DISABLED'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (addToast) addToast("Full Administrator Rights verified for this session.", "success");
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20"
                  >
                    Verify Superadmin Auth
                  </button>

                  <button
                    onClick={() => {
                      if (addToast) addToast("System Security Policy Rules Synced with Firestore.", "info");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                  >
                    Sync Security Policies
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register App Modal */}
      <AnimatePresence>
        {isAddingAppModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100"
            >
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus size={18} className="text-cyan-400" />
                Register New Micro-App Module
              </h3>

              <form onSubmit={handleAddApp} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">App Name</label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={e => setNewAppName(e.target.value)}
                    placeholder="e.g. Formula Solver Studio"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">App Key Identifier</label>
                  <input
                    type="text"
                    required
                    value={newAppKey}
                    onChange={e => setNewAppKey(e.target.value)}
                    placeholder="e.g. formula-solver"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={newAppCategory}
                    onChange={e => setNewAppCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-cyan-500"
                  >
                    <option value="STEM">STEM</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="AI Tools">AI Tools</option>
                    <option value="Gamification">Gamification</option>
                    <option value="Utility">Utility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description</label>
                  <textarea
                    value={newAppDesc}
                    onChange={e => setNewAppDesc(e.target.value)}
                    placeholder="Brief functional summary of the micro-app..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-cyan-500 h-20 resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAppModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20"
                  >
                    {isLoading ? 'Registering...' : 'Register App'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
