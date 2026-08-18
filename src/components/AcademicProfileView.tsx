import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Award, 
  Zap, 
  Target, 
  Brain, 
  Clock, 
  Star, 
  Shield, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  FileText,
  Plus,
  ExternalLink,
  Verified,
  Camera,
  Pencil,
  Info,
  Phone,
  School,
  GraduationCap,
  Share2,
  Settings,
  Users,
  UserPlus,
  Bell,
  MapPin,
  Lock,
  Eye,
  Globe,
  MoreVertical
} from 'lucide-react';
import { UserProfile, SkillPassport, Achievement, PortfolioItem } from '../types';

interface AcademicProfileViewProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
}

export const AcademicProfileView: React.FC<AcademicProfileViewProps> = ({ userProfile, onBack, onUpdateProfile }) => {
  const [skillPassport, setSkillPassport] = useState<SkillPassport | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'portfolio' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [venueDraft, setVenueDraft] = useState('');
  const [showVenueDialog, setShowVenueDialog] = useState(false);
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [editData, setEditData] = useState({
    bio: userProfile.bio || '',
    description: userProfile.description || '',
    phone: userProfile.phone || '',
    personal_venues: userProfile.personal_venues || [],
    role: userProfile.role,
    institution_id: userProfile.institution_id || ''
  });

  useEffect(() => {
    setEditData({
      bio: userProfile.bio || '',
      description: userProfile.description || '',
      phone: userProfile.phone || '',
      personal_venues: userProfile.personal_venues || [],
      role: userProfile.role,
      institution_id: userProfile.institution_id || ''
    });
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillRes, achievementRes, portfolioRes] = await Promise.all([
          fetch(`/api/skill-passport/${userProfile.user_name}`).then(res => res.json()),
          fetch(`/api/achievements/${userProfile.user_name}`).then(res => res.json()),
          fetch(`/api/portfolio/${userProfile.user_name}`).then(res => res.json())
        ]);
        setSkillPassport(skillRes);
        setAchievements(achievementRes);
        setPortfolio(portfolioRes);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };
    fetchData();
  }, [userProfile.user_name]);

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        ...userProfile,
        ...editData
      };
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      
      if (response.ok) {
        if (onUpdateProfile) {
          onUpdateProfile(updatedProfile);
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };

  const addVenue = () => {
    setVenueDraft('');
    setShowVenueDialog(true);
  };

  const saveVenue = () => {
    const venue = venueDraft.trim();
    if (!venue) return;
    setEditData(prev => ({ ...prev, personal_venues: [...prev.personal_venues, venue] }));
    setVenueDraft('');
    setShowVenueDialog(false);
  };

  const removeVenue = (index: number) => {
    setEditData(prev => ({
      ...prev,
      personal_venues: prev.personal_venues.filter((_, i) => i !== index)
    }));
  };

  const skillCategories = [
    { key: 'logical_thinking', label: 'Logical Thinking', icon: <Brain size={20} />, color: 'bg-blue-500' },
    { key: 'memory_strength', label: 'Memory Strength', icon: <Zap size={20} />, color: 'bg-purple-500' },
    { key: 'reaction_speed', label: 'Reaction Speed', icon: <Activity size={20} />, color: 'bg-emerald-500' },
    { key: 'math_accuracy', label: 'Math Accuracy', icon: <Target size={20} />, color: 'bg-amber-500' },
    { key: 'science_understanding', label: 'Science Understanding', icon: <Shield size={20} />, color: 'bg-rose-500' },
    { key: 'problem_solving', label: 'Problem Solving', icon: <TrendingUp size={20} />, color: 'bg-indigo-500' },
  ];

  const ProfileRow = ({ icon: Icon, label, value, subtext, editable = true, onClick }: any) => (
    <div 
      onClick={editable ? onClick : undefined}
      className={`flex items-start gap-6 py-6 border-b border-slate-100 group transition-colors ${editable ? 'cursor-pointer hover:bg-slate-50/50 px-4 -mx-4' : ''}`}
    >
      <div className="mt-1 text-slate-400">
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          {editable && <Pencil size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <p className="text-lg font-bold text-slate-900">{value || 'Not set'}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtext}</p>}
      </div>
    </div>
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* WhatsApp Style Header */}
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-indigo-600 font-bold text-sm flex items-center gap-1">
            <Pencil size={18} />
            Edit
          </button>
          <button onClick={async () => { const text = `${userProfile.user_name} — ${userProfile.role} on StudySnap`; try { if (navigator.share) await navigator.share({ title: 'StudySnap Profile', text }); else await navigator.clipboard?.writeText(text); } catch {} }} aria-label="Share profile" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <Share2 size={20} />
          </button>
          <button onClick={() => setActiveTab('settings')} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-32">
        {/* Edit Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">Edit Profile</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-full">
                    <Plus className="rotate-45 text-slate-400" size={24} />
                  </button>
                </div>
                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Bio Quote</label>
                    <input 
                      type="text" 
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                      placeholder="Enter a short bio quote..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Description</label>
                    <textarea 
                      rows={4}
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all resize-none"
                      placeholder="Describe your academic journey..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                      <input 
                        type="text" 
                        value={editData.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                      <select 
                        value={editData.role}
                        onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all appearance-none"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="researcher">Researcher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Institution</label>
                    <input 
                      type="text" 
                      value={editData.institution_id}
                      onChange={(e) => setEditData(prev => ({ ...prev, institution_id: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                      placeholder="Enter your institution name..."
                    />
                  </div>
                </div>
                <div className="p-8 bg-slate-50 flex gap-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Large Profile Picture Section */}
        <div className="flex flex-col items-center py-12 bg-slate-50/30">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full bg-indigo-100 border-4 border-white shadow-2xl overflow-hidden">
              <img 
                src={undefined} 
                alt="avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer" 
              />
            </div>
            <button onClick={() => setIsEditing(true)} aria-label="Change profile photo" className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform">
              <Camera size={20} />
            </button>
            {userProfile.reputation_level === 'academic_master' && (
              <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Star size={18} className="fill-current" />
              </div>
            )}
          </div>
          <div className="mt-6 text-center px-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 justify-center">
              {userProfile.user_name}
              <Verified size={20} className="text-emerald-500" />
            </h2>
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mt-1">
              {userProfile.reputation_level.replace('_', ' ')}
            </p>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-md mx-auto italic">
              "{userProfile.bio || 'Passionate learner exploring the world of knowledge.'}"
            </p>
          </div>

          {/* Followers / Following / Subscribers */}
          <div className="mt-8 flex items-center gap-8">
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{formatNumber(userProfile.followers_count)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{formatNumber(userProfile.following_count)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Following</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{formatNumber(userProfile.subscribers_count)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscribers</p>
            </div>
          </div>
        </div>

        {/* Tabs for Skills, Portfolio, Settings */}
        <div className="mt-6 px-6">
          <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-slate-50 border border-slate-100">
            {(['overview', 'skills', 'portfolio', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all capitalize ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Description Card */}
                <div 
                  onClick={() => setIsEditing(true)}
                  className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h3>
                    <Pencil size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {userProfile.description || 'Dedicated to academic excellence and collaborative learning. Always looking for new challenges and opportunities to grow.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <ProfileRow 
                    icon={Phone} 
                    label="Phone" 
                    value={userProfile.phone || 'Not set'} 
                    subtext="Your contact number for study group coordination."
                    onClick={() => setIsEditing(true)}
                  />
                  <ProfileRow 
                    icon={GraduationCap} 
                    label="Role" 
                    value={userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} 
                    onClick={() => setIsEditing(true)}
                  />
                  <ProfileRow 
                    icon={School} 
                    label="Institution" 
                    value={userProfile.institution_id || 'Not linked'} 
                    subtext="Your primary academic affiliation."
                    onClick={() => setIsEditing(true)}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {skillCategories.map(cat => {
                  const value = skillPassport ? (skillPassport as any)[cat.key] : 0;
                  const level = Math.floor(value / 100) + 1;
                  const progress = value % 100;
                  
                  return (
                    <div key={cat.key} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${cat.color} text-white flex items-center justify-center shadow-lg shadow-current/20`}>
                            {cat.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{cat.label}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level {level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">{value}</span>
                          <span className="text-xs text-slate-400 ml-1">pts</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full ${cat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Academic Portfolio</h3>
                  <button onClick={addVenue} aria-label="Add portfolio item" className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {portfolio.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                      <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-slate-400 font-medium">No works added to portfolio yet.</p>
                    </div>
                  ) : (
                    portfolio.map(item => (
                      <div key={item.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{item.title}</h4>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.type}</span>
                            </div>
                          </div>
                          {item.is_verified && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                              <Verified size={12} />
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-400">Added {new Date(item.created_at).toLocaleDateString()}</span>
                          {item.content_url ? (
                            <button onClick={() => window.open(item.content_url, '_blank', 'noopener,noreferrer')} className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:translate-x-1 transition-transform">
                              View Details <ExternalLink size={16} />
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">Details unavailable</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Personal Venues Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="text-indigo-600" size={20} />
                      Personal Venues
                    </h3>
                    <button onClick={addVenue} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                      <Plus size={16} />
                      Add Venue
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {editData.personal_venues.map((venue, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <School size={20} />
                          </div>
                          <p className="font-bold text-slate-900">{venue}</p>
                        </div>
                        <button onClick={() => removeVenue(i)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <Plus className="rotate-45" size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Account Settings Section */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <Lock className="text-indigo-600" size={20} />
                    Account Settings
                  </h3>
                  <div className="space-y-2">
                    {[
                      { icon: Eye, label: 'Profile Visibility', value: 'Public', color: 'text-blue-500' },
                      { icon: Globe, label: 'Language', value: 'English (US)', color: 'text-emerald-500' },
                      { icon: Bell, label: 'Notifications', value: 'All Enabled', color: 'text-amber-500' },
                    ].map((setting, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${setting.color}`}>
                            <setting.icon size={20} />
                          </div>
                          <p className="font-bold text-slate-900">{setting.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">{setting.value}</span>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Privacy Section */}
                <section className="p-6 rounded-[32px] bg-indigo-600 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Privacy Shield Active</h4>
                    <p className="text-indigo-100 text-sm mb-6">Your data is encrypted and only shared with authorized institutions.</p>
                    <button onClick={() => setShowPrivacyPanel(true)} className="px-6 py-3 min-h-11 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors">
                      Review Privacy Policy
                    </button>
                  </div>
                  <Shield className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      {showVenueDialog && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="venue-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 id="venue-title" className="text-xl font-black text-slate-900">Add study venue</h3>
            <p className="text-sm text-slate-500 mt-1">Give your study place a name.</p>
            <input autoFocus value={venueDraft} onChange={e => setVenueDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveVenue()} placeholder="e.g. Library" className="w-full mt-5 h-12 rounded-2xl border border-slate-200 px-4 outline-none focus:border-indigo-500" />
            <div className="flex gap-3 mt-5"><button onClick={() => setShowVenueDialog(false)} className="flex-1 min-h-11 rounded-2xl bg-slate-100 font-bold">Cancel</button><button onClick={saveVenue} disabled={!venueDraft.trim()} className="flex-1 min-h-11 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-40">Add venue</button></div>
          </div>
        </div>
      )}
      {showPrivacyPanel && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
          <div className="w-full max-w-lg max-h-[80dvh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h3 id="privacy-title" className="text-xl font-black text-slate-900">StudySnap privacy</h3>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">Your academic profile is stored under your account. Institution access is controlled by Firebase Authentication and Firestore security rules. Avoid placing passwords, private keys, or highly sensitive information in profile fields.</p>
            <button onClick={() => setShowPrivacyPanel(false)} className="mt-6 w-full min-h-11 rounded-2xl bg-indigo-600 text-white font-bold">Done</button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};
