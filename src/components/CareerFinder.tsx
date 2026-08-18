import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ChevronLeft, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  ArrowRight,
  Star,
  Brain,
  Lightbulb,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { UserProfile, SkillPassport } from '../types';
import { authedFetch } from "../lib/authedFetch";

interface CareerFinderProps {
  userProfile: UserProfile | null;
  skillPassport: SkillPassport | null;
  onBack: () => void;
}

interface CareerPath {
  title: string;
  description: string;
  match_score: number;
  required_skills: string[];
  recommended_subjects: string[];
  salary_range: string;
  growth_potential: 'high' | 'medium' | 'low';
}

export const CareerFinder: React.FC<CareerFinderProps> = ({ userProfile, skillPassport, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [roadmapSaved, setRoadmapSaved] = useState(false);
  const [focusStarted, setFocusStarted] = useState(false);

  const analyzeCareers = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Based on the following student profile, suggest 3-4 career paths. 
      Student Name: ${userProfile?.user_name}
      Age Group: ${userProfile?.age_group}
      Skills: 
      - Logical Thinking: ${skillPassport?.logical_thinking}/100
      - Memory Strength: ${skillPassport?.memory_strength}/100
      - Reaction Speed: ${skillPassport?.reaction_speed}/100
      - Math Accuracy: ${skillPassport?.math_accuracy}/100
      - Science Understanding: ${skillPassport?.science_understanding}/100
      - Problem Solving: ${skillPassport?.problem_solving}/100
      
      Return the response as a JSON array of objects with the following structure:
      {
        "title": "Career Title",
        "description": "Brief description",
        "match_score": 0-100,
        "required_skills": ["skill1", "skill2"],
        "recommended_subjects": ["subject1", "subject2"],
        "salary_range": "$X - $Y",
        "growth_potential": "high" | "medium" | "low"
      }`;

      const response = await authedFetch('/api/gemini/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) throw new Error('API failed');
      const results = await response.json();
      setCareerPaths(results);
    } catch (error) {
      console.error('Career analyzer error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (careerPaths.length === 0) {
      analyzeCareers();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Career Path Finder</h1>
            <p className="text-slate-500">Linking your learning to real-world outcomes</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <Compass size={24} />
        </div>
      </header>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={48} className="text-indigo-600 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your profile...</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
              Our AI is evaluating your strengths, interests, and academic performance to find the perfect career paths for you.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Career List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Target size={20} className="text-indigo-600" />
                Recommended Paths
              </h2>
              <button 
                onClick={analyzeCareers}
                className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={14} />
                Re-analyze
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerPaths.map((path, i) => (
                <motion.button
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPath(path)}
                  className={`p-8 rounded-[40px] text-left transition-all border-2 ${selectedPath?.title === path.title ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-transparent bg-white shadow-sm hover:border-indigo-100'}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Briefcase size={28} />
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                      {path.match_score}% Match
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{path.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6">{path.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {path.recommended_subjects.slice(0, 2).map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {selectedPath ? (
                <motion.div
                  key={selectedPath.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Lightbulb size={24} className="text-amber-500" />
                    Path Details
                  </h3>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPath.required_skills.map(s => (
                          <div key={s} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold">
                            <CheckCircle2 size={14} />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Recommended Subjects</label>
                      <div className="space-y-3">
                        {selectedPath.recommended_subjects.map(s => (
                          <div key={s} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                            <BookOpen size={18} className="text-slate-400" />
                            <span className="font-bold text-slate-700">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-3xl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Salary Range</label>
                        <p className="font-bold text-slate-900">{selectedPath.salary_range}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-3xl">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Growth</label>
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <TrendingUp size={14} />
                          <span className="capitalize">{selectedPath.growth_potential}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => { localStorage.setItem('studysnap-career-roadmap', JSON.stringify(selectedPath)); setRoadmapSaved(true); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      {roadmapSaved ? 'Roadmap Saved ✓' : 'View Learning Roadmap'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-6">
                    <Briefcase size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Path</h3>
                  <p className="text-slate-500 text-sm">
                    Choose a career path from the list to see detailed requirements and your learning roadmap.
                  </p>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100">
              <Sparkles className="mb-4 text-indigo-200" size={32} />
              <h3 className="text-xl font-bold mb-2">Skill Gap Analysis</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                You're already 70% ready for a career in Data Science! Focus on "Mathematics" to close the gap.
              </p>
              <button onClick={() => { localStorage.setItem('studysnap-focus-topic', selectedPath?.recommended_subjects?.[0] || 'Core Skills'); setFocusStarted(true); }} className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors">
                {focusStarted ? 'Focused Study Ready ✓' : 'Start Focused Study'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RotateCcw: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export default CareerFinder;
