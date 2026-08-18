import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Search,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Institution, Department, Course, UserProfile } from '../types';
import { authedFetch } from '../lib/authedFetch';

interface CampusModeProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const CampusMode: React.FC<CampusModeProps> = ({ userProfile, onBack }) => {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'courses' | 'collaboration' | 'map'>('overview');
  const [discussionCourse, setDiscussionCourse] = useState<Course | null>(null);


  useEffect(() => {
    if (userProfile.institution_id) {
      authedFetch(`/api/institutions/${userProfile.institution_id}`)
        .then(async res => { if (!res.ok) throw new Error('Institution unavailable'); return res.json(); })
        .then(setInstitution)
        .catch(() => setInstitution(null));
    }
  }, [userProfile.institution_id]);

  if (!institution) {
    return (
      <div className="p-8 text-center mt-20">
        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={40} />
        </div>
        <h2 className="text-2xl font-black text-app-text mb-2">Institution Hub</h2>
        <p className="text-app-text-muted mb-8">Join or select an institution to access courses, departments, services and community spaces.</p>
        <button 
          onClick={onBack}
          className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg pb-32">
      {/* Campus Header */}
      <div className="bg-indigo-600 p-8 pt-12 text-white rounded-b-[40px] shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 -ml-2 text-white/80">
            <ArrowLeft size={28} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">{institution.name}</h1>
            <p className="text-sm text-white/70">{institution.type.replace('_', ' ')} • Institution Hub</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-2">
          {['overview', 'departments', 'courses', 'collaboration', 'map'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-2 rounded-full text-sm font-bold min-h-11 transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab === 'map' ? 'Locations' : tab === 'collaboration' ? 'Community' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm">
                <div className="text-indigo-600 mb-2"><Users size={24} /></div>
                <div className="text-2xl font-black text-app-text">{institution.departments.length}</div>
                <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Departments</div>
              </div>
              <div className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm">
                <div className="text-indigo-600 mb-2"><BookOpen size={24} /></div>
                <div className="text-2xl font-black text-app-text">{institution.departments.length}</div>
                <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Courses</div>
              </div>
            </div>

            <div className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm">
              <h3 className="text-lg font-black text-app-text mb-4">Recent Announcements</h3>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-app-bg border border-app-border">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-app-text text-sm">New Online Exam Scheduled</h4>
                      <p className="text-xs text-app-text-muted mt-1">Final exams for Computer Science start next week. Please check your schedule.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 gap-4">
            {institution.departments.map(dept => (
              <motion.div
                key={dept.id}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <LayoutDashboard size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-app-text">{dept.name}</h3>
                    <p className="text-xs text-app-text-muted">{dept.courses.length} Courses</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-app-text-muted" />
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted" size={20} />
              <input 
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                className="w-full p-4 pl-12 rounded-2xl bg-app-card border border-app-border outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {institution.departments.flatMap(d => d.courses).filter(course => `${course.code} ${course.name} ${course.description}`.toLowerCase().includes(courseSearch.toLowerCase())).map(course => (
                <div key={course.id} className="p-6 rounded-3xl bg-app-card border border-app-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{course.code}</span>
                    <button onClick={() => setDiscussionCourse(course)} aria-label={`Message about ${course.name}`} className="text-app-text-muted"><MessageSquare size={18} /></button>
                  </div>
                  <h3 className="font-bold text-app-text mb-1">{course.name}</h3>
                  <p className="text-xs text-app-text-muted line-clamp-2">{course.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg">
              <h3 className="text-xl font-black mb-2">Research Hub</h3>
              <p className="text-sm text-white/80 mb-6">Collaborate with researchers and students across departments.</p>
              <button onClick={() => setActiveTab('collaboration')} className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50">Open Research Hub</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black text-app-text">Active Discussions</h3>
              {[1, 2, 3].map(i => (
                <div key={i} className="p-5 rounded-3xl bg-app-card border border-app-border shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center font-black text-indigo-600">{String(i + 1)}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-app-text">AI in Modern Medicine</h4>
                    <p className="text-xs text-app-text-muted">Last reply 5m ago • 12 participants</p>
                  </div>
                  <ChevronRight size={18} className="text-app-text-muted" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="w-full min-h-64 rounded-3xl overflow-hidden border border-app-border relative bg-app-bg">
            <div className="w-full min-h-64 flex flex-col items-center justify-center p-6 text-center">
              <MapPin size={48} className="text-app-accent mb-4" />
              <h3 className="text-xl font-bold text-app-text mb-2">Campus map data not configured</h3>
              <p className="text-sm text-app-text-muted max-w-sm">
                StudySnap will show verified institution locations once the verified institution provides campus coordinates. No placeholder locations are shown.
              </p>
              {institution.address && <p className="text-xs text-app-text-muted mt-3 max-w-sm">{institution.address}</p>}
            </div>
          </div>
        )}
      </div>
      {discussionCourse && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="course-discussion-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 id="course-discussion-title" className="text-xl font-black text-slate-900">{discussionCourse.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{discussionCourse.code} • Course discussion</p>
            <p className="text-sm text-slate-600 mt-5">Course discussion is available through the StudySnap Group Study and Community workspaces, where realtime messaging and moderation controls are active.</p>
            <button onClick={() => setDiscussionCourse(null)} className="mt-6 w-full min-h-11 rounded-2xl bg-indigo-600 text-white font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
