import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ChevronLeft, 
  Clock, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Settings, 
  Lock, 
  Unlock,
  Eye,
  Calendar,
  BarChart3,
  User,
  ArrowRight
} from 'lucide-react';
import { UserProfile, FocusStats, ActivityLog } from '../types';
import { DataService } from '../services/dataService';

interface ParentModeProps {
  userProfile: UserProfile | null;
  stats: FocusStats;
  onBack: () => void;
  onUpdateLimit: (minutes: number) => void;
  onUpdatePermissions: (canGoLive: boolean, avatarFilter: boolean) => void;
  onUpdatePin: (pin: string) => void;
}

export const ParentMode: React.FC<ParentModeProps> = ({ userProfile, stats, onBack, onUpdateLimit, onUpdatePermissions, onUpdatePin }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'goals'>('overview');
  const [limit, setLimit] = useState(userProfile?.screen_time_limit || 60);
  const [canGoLive, setCanGoLive] = useState(userProfile?.can_go_live || false);
  const [avatarFilter, setAvatarFilter] = useState(userProfile?.avatar_filter_enabled || false);

  // PIN setup / change flow state
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinFormError, setPinFormError] = useState('');
  const [pinSavedMsg, setPinSavedMsg] = useState('');

  useEffect(() => {
    onUpdatePermissions(canGoLive, avatarFilter);
  }, [canGoLive, avatarFilter]);

  const handleUnlock = () => {
    const correctPin = userProfile?.parental_pin;
    if (!correctPin) {
      // No hardcoded fallback: if the account has no PIN configured yet,
      // require the parent to set one explicitly rather than silently
      // accepting a guessable default.
      setNeedsPinSetup(true);
      setError('');
      return;
    }
    if (pin === correctPin) {
      setIsLocked(false);
      setError('');
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const persistPin = async (nextPin: string) => {
    await DataService.updateUserProfile({
      parental_pin: nextPin,
      parental_pin_updated_at: new Date().toISOString(),
    } as Partial<UserProfile>);
    onUpdatePin(nextPin);
  };

  const handleSetupPin = async () => {
    setPinFormError('');
    if (!/^\d{4,6}$/.test(newPinInput)) {
      setPinFormError('PIN must be 4-6 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinFormError('PINs do not match.');
      return;
    }
    try {
      await persistPin(newPinInput);
      setNeedsPinSetup(false);
      setIsLocked(false);
      setNewPinInput('');
      setConfirmPinInput('');
    } catch {
      setPinFormError('Could not save PIN. Check your connection and try again.');
    }
  };

  const handleChangePin = async () => {
    setPinFormError('');
    const correctPin = userProfile?.parental_pin;
    if (currentPinInput !== correctPin) {
      setPinFormError('Current PIN is incorrect.');
      return;
    }
    if (!/^\d{4,6}$/.test(newPinInput)) {
      setPinFormError('New PIN must be 4-6 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinFormError('New PINs do not match.');
      return;
    }
    try {
      await persistPin(newPinInput);
      setShowChangePin(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setPinSavedMsg('PIN updated successfully.');
      setTimeout(() => setPinSavedMsg(''), 4000);
    } catch {
      setPinFormError('Could not save PIN. Check your connection and try again.');
    }
  };

  if (needsPinSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 p-12 rounded-[48px] border border-white/10 shadow-2xl"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-8">
            <Shield size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Set Up Parental PIN</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            This account doesn't have a parental PIN yet. Choose a 4-6 digit PIN to protect this dashboard.
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={newPinInput}
            onChange={e => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="New PIN"
            className="w-full mb-4 h-14 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-widest outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            inputMode="numeric"
            value={confirmPinInput}
            onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Confirm PIN"
            className="w-full mb-6 h-14 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-xl tracking-widest outline-none focus:border-indigo-500"
          />
          {pinFormError && <p className="text-rose-500 text-sm font-bold mb-4">{pinFormError}</p>}
          <button onClick={handleSetupPin} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold mb-4 transition-colors">
            Save PIN
          </button>
          <button onClick={() => { setNeedsPinSetup(false); onBack(); }} className="text-slate-500 font-bold hover:text-white transition-colors">
            Cancel and Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 p-12 rounded-[48px] border border-white/10 shadow-2xl"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-8">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Parental Access</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Enter your 4-digit PIN to access the Parent & Guardian dashboard.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i}
                className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-600'}`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {error && <p className="text-rose-500 text-sm font-bold mb-6">{error}</p>}

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(num => (
              <button
                key={num}
                onClick={() => {
                  if (num === 'C') setPin('');
                  else if (num === 'OK') handleUnlock();
                  else if (pin.length < 4) setPin(prev => prev + num);
                }}
                className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 ${num === 'OK' ? 'bg-indigo-600 text-white col-span-1' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {num}
              </button>
            ))}
          </div>

          <button onClick={onBack} className="text-slate-500 font-bold hover:text-white transition-colors">
            Cancel and Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
            <p className="text-slate-500">Monitoring {userProfile?.user_name}'s progress</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('goals')} aria-label="Parent settings" className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 hover:text-indigo-600 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={() => setIsLocked(true)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 hover:text-rose-600 transition-colors">
            <Unlock size={20} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {(['overview', 'reports', 'goals'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">{stats.total_study_time}m</h3>
                  <p className="text-slate-500 text-sm">Total Study Time</p>
                  <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.total_study_time / limit) * 100}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {Math.round((stats.total_study_time / limit) * 100)}% of Daily Limit ({limit}m)
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">{stats.quiz_accuracy}%</h3>
                  <p className="text-slate-500 text-sm">Average Quiz Performance</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <TrendingUp size={16} />
                    +5% from last week
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-600" />
                  Weekly Activity
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[45, 60, 30, 90, 120, 45, 20].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / 120) * 100}%` }}
                        className={`w-full rounded-t-xl ${val > 90 ? 'bg-indigo-600' : 'bg-indigo-200'}`}
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Permissions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-900">Allow Going Live</span>
                    <button 
                      onClick={() => setCanGoLive(!canGoLive)}
                      className={`w-12 h-6 rounded-full transition-colors ${canGoLive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${canGoLive ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-900">Enable Avatar Filter</span>
                    <button 
                      onClick={() => setAvatarFilter(!avatarFilter)}
                      className={`w-12 h-6 rounded-full transition-colors ${avatarFilter ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${avatarFilter ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Set Study Goals</h3>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Daily Screen Time Limit: {limit}m</label>
                    <input 
                      type="range" 
                      min="30" 
                      max="300" 
                      step="15"
                      value={limit}
                      onChange={e => setLimit(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>30 MIN</span>
                      <span>150 MIN</span>
                      <span>300 MIN</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onUpdateLimit(limit)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                  >
                    Save Limits
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Academic Rewards</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Complete 5 Quizzes', reward: 'Extra 30m Gaming', completed: true },
                    { title: 'Maintain 7-Day Streak', reward: 'Weekend Outing', completed: false },
                    { title: 'Score 90% in Science', reward: 'New Book', completed: false },
                  ].map((goal, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        {goal.completed ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Target className="text-slate-300" size={20} />}
                        <div>
                          <h4 className={`font-bold text-sm ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{goal.title}</h4>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Reward: {goal.reward}</p>
                        </div>
                      </div>
                      {!goal.completed && <button onClick={() => setActiveTab('goals')} className="text-xs font-bold text-indigo-600 hover:underline">Edit</button>}
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('goals')} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold text-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                    + Add New Reward
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-200">
            <Shield className="mb-4 text-indigo-200" size={32} />
            <h3 className="text-xl font-bold mb-2">Safety Report</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              All interactions in the Live Arena and Study Rooms are being monitored. No unusual activity detected.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full w-fit">
              <Eye size={14} />
              Real-time Monitoring Active
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Areas for Improvement
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-900 text-sm mb-1">Mathematics</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Struggling with "Algebraic Expressions". Suggested 15m extra practice daily.
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 text-sm mb-1">Consistency</h4>
                <p className="text-indigo-700 text-xs leading-relaxed">
                  Study sessions are often interrupted. Try setting a "Focus Mode" during study time.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white">
            <User className="mb-4 text-slate-500" size={32} />
            <h3 className="text-xl font-bold mb-2">Account Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {userProfile?.parental_pin_updated_at
                ? `Your parental PIN was last changed on ${new Date(userProfile.parental_pin_updated_at).toLocaleDateString()}. We recommend updating it every 90 days.`
                : 'Keep your parental PIN private and update it periodically to keep this dashboard secure.'}
            </p>
            {pinSavedMsg && <p className="text-emerald-400 text-sm font-bold mb-4">{pinSavedMsg}</p>}
            <button onClick={() => { setShowChangePin(true); setPinFormError(''); setCurrentPinInput(''); setNewPinInput(''); setConfirmPinInput(''); }} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors">
              Change PIN
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showChangePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6"
            onClick={() => setShowChangePin(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full bg-white rounded-[32px] p-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">Change Parental PIN</h3>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={currentPinInput}
                onChange={e => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Current PIN"
                className="w-full mb-3 h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500 text-center tracking-widest"
              />
              <input
                type="password"
                inputMode="numeric"
                value={newPinInput}
                onChange={e => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="New PIN"
                className="w-full mb-3 h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500 text-center tracking-widest"
              />
              <input
                type="password"
                inputMode="numeric"
                value={confirmPinInput}
                onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Confirm new PIN"
                className="w-full mb-4 h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500 text-center tracking-widest"
              />
              {pinFormError && <p className="text-rose-600 text-sm font-bold mb-4">{pinFormError}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowChangePin(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleChangePin} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentMode;
