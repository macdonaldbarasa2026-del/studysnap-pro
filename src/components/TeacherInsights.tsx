import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3, 
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Target,
  Brain
} from 'lucide-react';
import { UserProfile, TeacherInsights as TeacherInsightsType } from '../types';

interface TeacherInsightsProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const TeacherInsights: React.FC<TeacherInsightsProps> = ({ userProfile, onBack }) => {
  const [insights, setInsights] = useState<TeacherInsightsType | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<{ skill: string; student_count: number } | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!userProfile.institution_id) return;
      try {
        const res = await fetch(`/api/teacher/insights/${userProfile.institution_id}`);
        const data = await res.json();
        setInsights(data);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [userProfile.institution_id]);

  if (!userProfile.institution_id) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-app-text">Institution Required</h2>
        <p className="text-app-text-muted">You must be part of an institution to view teacher insights.</p>
        <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-app-text">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-app-text">Teacher Insights</h1>
            <p className="text-app-text-muted font-medium">Class performance & difficulty detection</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search students..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-2xl bg-app-card border border-app-border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => setCriticalOnly(v => !v)} aria-pressed={criticalOnly} aria-label="Filter teacher insights" className={`p-2 rounded-2xl border text-app-text ${criticalOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-app-card border-app-border'}`}>
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-[40px] bg-app-card animate-pulse" />
          ))}
        </div>
      ) : insights ? (
        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                  <BarChart3 size={24} />
                </div>
                <h3 className="font-bold text-app-text">Avg. Performance</h3>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-app-text">{Math.round(insights.average_performance)}%</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1 mb-2">
                  <TrendingUp size={16} /> +2.4%
                </span>
              </div>
              <p className="text-sm text-app-text-muted mt-2">Across all subjects this week</p>
            </div>

            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="font-bold text-app-text">Critical Topics</h3>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-app-text">{insights.topic_failure_rates.filter(t => t.failure_rate > 40).length}</span>
                <span className="text-app-text-muted font-bold mb-2">topics</span>
              </div>
              <p className="text-sm text-app-text-muted mt-2">Require immediate attention</p>
            </div>

            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-app-text">Struggling Students</h3>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-app-text">{insights.weak_skills.reduce((acc, s) => acc + s.student_count, 0)}</span>
                <span className="text-rose-500 font-bold flex items-center gap-1 mb-2">
                  <TrendingDown size={16} /> +3
                </span>
              </div>
              <p className="text-sm text-app-text-muted mt-2">Detected learning difficulties</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Topic Failure Rates */}
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border">
              <h3 className="text-xl font-black text-app-text mb-6">Topic Difficulty Analysis</h3>
              <div className="space-y-6">
                {insights.topic_failure_rates.filter(topic => (!criticalOnly || topic.failure_rate > 40) && topic.topic.toLowerCase().includes(studentSearch.toLowerCase())).map((topic, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-app-text">{topic.topic}</span>
                      <span className={topic.failure_rate > 40 ? 'text-rose-500' : 'text-app-text-muted'}>
                        {Math.round(topic.failure_rate)}% failure rate
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-app-bg overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.failure_rate}%` }}
                        className={`h-full rounded-full ${topic.failure_rate > 40 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                  </div>
                ))}
                {insights.topic_failure_rates.length === 0 && (
                  <p className="text-center py-8 text-app-text-muted">No topic data available yet.</p>
                )}
              </div>
            </div>

            {/* Weak Skills Across Class */}
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border">
              <h3 className="text-xl font-black text-app-text mb-6">Weak Skills Distribution</h3>
              <div className="space-y-4">
                {insights.weak_skills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-app-bg border border-app-border">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white shadow-sm">
                        {skill.skill.includes('Logic') ? <Brain className="text-emerald-500" size={20} /> : <BookOpen className="text-indigo-500" size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-app-text">{skill.skill}</h4>
                        <p className="text-xs text-app-text-muted">{skill.student_count} students struggling</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSkill(skill)} aria-label={`View ${skill.skill} details`} className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
                {insights.weak_skills.length === 0 && (
                  <p className="text-center py-8 text-app-text-muted">No weak skills detected in this class.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="p-8 rounded-[40px] bg-indigo-900 text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Target size={24} /> Recommended Lesson Adjustments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/10 border border-white/10">
                <h4 className="font-bold mb-2">Review Session Needed</h4>
                <p className="text-sm text-indigo-100">
                  Based on recent quiz results, 65% of students are struggling with <span className="font-bold text-white">Algebraic Equations</span>. Consider a dedicated review session.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 border border-white/10">
                <h4 className="font-bold mb-2">New Resource Suggestion</h4>
                <p className="text-sm text-indigo-100">
                  Students are showing high engagement with <span className="font-bold text-white">Logic Games</span>. Integrating more gamified logic puzzles could improve reaction speeds.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <p className="text-app-text-muted">No insights available for this institution.</p>
        </div>
      )}
{selectedSkill && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="skill-detail-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 id="skill-detail-title" className="text-xl font-black text-slate-900">{selectedSkill.skill}</h3>
            <p className="text-sm text-slate-600 mt-3">{selectedSkill.student_count} students currently need support in this area.</p>
            <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">Suggested action: create a short retrieval practice activity and revisit the topic after the next lesson.</div>
            <button onClick={() => setSelectedSkill(null)} className="mt-6 w-full min-h-11 rounded-2xl bg-indigo-600 text-white font-bold">Done</button>
          </div>
        </div>
      )}
    </div>

  );
};

export default TeacherInsights;