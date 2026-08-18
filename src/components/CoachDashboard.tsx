import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap, 
  Flame, 
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { StudyPlan, CoachInsight, FocusStats, ActivityLog, Subject } from '../types';
import { generateStudyPlan, generateCoachInsights } from '../services/gemini';

interface CoachDashboardProps {
  userName: string;
  subjects: Subject[];
  onBack: () => void;
}

export default function CoachDashboard({ userName, subjects, onBack }: CoachDashboardProps) {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [planRes, insightsRes, statsRes, logsRes] = await Promise.all([
        fetch(`/api/coach/plan/${userName}`),
        fetch(`/api/coach/insights/${userName}`),
        fetch(`/api/coach/stats/${userName}`),
        fetch(`/api/coach/logs/${userName}`)
      ]);

      const planData = await planRes.json();
      const insightsData = await insightsRes.json();
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      setPlan(planData);
      setInsights(insightsData);
      setStats(statsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch coach data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const goals = `Focus on ${subjects.map(s => s.name).join(', ')}. Improve accuracy and speed.`;
      const newPlan = await generateStudyPlan(userName, goals);
      if (newPlan) {
        const planToSave = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString().split('T')[0],
          items: newPlan.tasks.map((item: any) => ({ 
            id: Math.random().toString(36).substr(2, 9),
            title: item.title,
            duration: item.duration,
            type: item.type,
            description: `AI recommended session for ${item.title}`,
            completed: false 
          })),
          focus_goal: 120
        };
        
        await fetch(`/api/coach/plan/${userName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planToSave)
        });
        
        setPlan(planToSave);

        // Also generate new insights
        const newInsights = await generateCoachInsights(userName, logs);
        if (newInsights && newInsights.length > 0) {
          const insightsToSave = newInsights.map((insight: any) => ({
            ...insight,
            id: Math.random().toString(36).substr(2, 9)
          }));
          
          await fetch(`/api/coach/insights/${userName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ insights: insightsToSave })
          });
          
          setInsights(prev => [...insightsToSave, ...prev].slice(0, 10));
        }
      }
    } catch (error) {
      console.error("Failed to generate plan", error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    if (!plan) return;
    
    const newItems = plan.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const updatedPlan = { ...plan, items: newItems };
    setPlan(updatedPlan);

    await fetch(`/api/coach/plan/${userName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlan)
    });
  };

  const chartData = logs.slice(0, 7).reverse().map(log => ({
    name: new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
    time: Math.floor(log.duration / 60),
    accuracy: log.accuracy || 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-app-text-muted font-bold">Consulting your AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-app-card rounded-full transition-colors text-app-text-muted">
              <ChevronLeft size={24} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Brain size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-app-text tracking-tight">AI Study Coach</h1>
              <p className="text-app-text-muted text-sm font-medium">Personalized guidance for {userName}</p>
            </div>
          </div>
          <button 
            onClick={handleGeneratePlan}
            disabled={generating}
            className="px-6 py-3 rounded-2xl bg-white border border-app-border text-indigo-600 font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            {generating ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            <span>Refresh Plan</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <Flame size={20} />
              </div>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                <ArrowUpRight size={14} /> +1
              </span>
            </div>
            <div className="text-2xl font-black text-app-text">{stats?.streak_days || 0} Days</div>
            <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Study Streak</div>
          </div>

          <div className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                <Clock size={20} />
              </div>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                <ArrowUpRight size={14} /> 12%
              </span>
            </div>
            <div className="text-2xl font-black text-app-text">{stats?.total_study_time || 0}m</div>
            <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Focus Time</div>
          </div>

          <div className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Target size={20} />
              </div>
              <span className="text-rose-500 text-xs font-bold flex items-center gap-1">
                <ArrowDownRight size={14} /> 3%
              </span>
            </div>
            <div className="text-2xl font-black text-app-text">{Math.round(stats?.quiz_accuracy || 0)}%</div>
            <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Avg Accuracy</div>
          </div>

          <div className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <Zap size={20} />
              </div>
              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                <ArrowUpRight size={14} /> 240
              </span>
            </div>
            <div className="text-2xl font-black text-app-text">{stats?.focus_points || 0}</div>
            <div className="text-xs text-app-text-muted font-bold uppercase tracking-wider">Focus Points</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-app-text flex items-center gap-2">
                <Calendar size={24} className="text-indigo-600" />
                Today's Study Plan
              </h2>
              <div className="text-sm font-bold text-app-text-muted">
                {plan?.items.filter(i => i.completed).length || 0} / {plan?.items.length || 0} Completed
              </div>
            </div>

            <div className="space-y-4">
              {plan ? plan.items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-6 rounded-[32px] border flex items-center gap-6 transition-all text-left ${
                    item.completed 
                      ? 'bg-emerald-50 border-emerald-100 opacity-75' 
                      : 'bg-app-card border-app-border shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    item.completed ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {item.completed ? <CheckCircle2 size={24} /> : (
                      item.type === 'revision' ? <Clock size={24} /> :
                      item.type === 'flashcards' ? <Zap size={24} /> :
                      item.type === 'quiz' ? <Target size={24} /> :
                      <Brain size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-black ${item.completed ? 'text-emerald-900 line-through' : 'text-app-text'}`}>
                        {item.title}
                      </h3>
                      <span className="text-xs font-bold text-app-text-muted">{item.duration} min</span>
                    </div>
                    <p className={`text-sm ${item.completed ? 'text-emerald-600/70' : 'text-app-text-muted'}`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={20} className={item.completed ? 'text-emerald-400' : 'text-app-border'} />
                </motion.button>
              )) : (
                <div className="p-12 rounded-[40px] bg-indigo-50 border border-indigo-100 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                    <Brain size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-indigo-900">No Plan Yet</h3>
                    <p className="text-indigo-600/70 text-sm">Let your AI Coach build a personalized plan for you.</p>
                  </div>
                  <button 
                    onClick={handleGeneratePlan}
                    className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200"
                  >
                    Generate Daily Plan
                  </button>
                </div>
              )}
            </div>

            {/* Focus Chart */}
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-app-text flex items-center gap-2">
                  <BarChart3 size={22} className="text-indigo-600" />
                  Focus Progress
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-app-text-muted">Time (min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-app-text-muted">Accuracy (%)</span>
                  </div>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTime)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar: Insights & Motivation */}
          <div className="space-y-8">
            {/* AI Insights */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                Coach Insights
              </h3>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-5 rounded-3xl border ${
                      insight.type === 'weak_area' ? 'bg-rose-50 border-rose-100' :
                      insight.type === 'strength' ? 'bg-emerald-50 border-emerald-100' :
                      'bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${
                        insight.type === 'weak_area' ? 'bg-rose-500 text-white' :
                        insight.type === 'strength' ? 'bg-emerald-500 text-white' :
                        'bg-indigo-500 text-white'
                      }`}>
                        {insight.type === 'weak_area' ? <AlertCircle size={16} /> :
                         insight.type === 'strength' ? <TrendingUp size={16} /> :
                         <Brain size={16} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm ${
                          insight.type === 'weak_area' ? 'text-rose-900' :
                          insight.type === 'strength' ? 'text-emerald-900' :
                          'text-indigo-900'
                        }`}>
                          {insight.title}
                        </h4>
                        <p className={`text-xs leading-relaxed ${
                          insight.type === 'weak_area' ? 'text-rose-600' :
                          insight.type === 'strength' ? 'text-emerald-600' :
                          'text-indigo-600'
                        }`}>
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="p-8 rounded-3xl bg-app-card border border-app-border text-center text-app-text-muted text-sm italic">
                    Start studying to get personalized insights from your coach.
                  </div>
                )}
              </div>
            </div>

            {/* Rewards / Badges */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-indigo-500" />
                Skill Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Zap size={20} />, label: 'Fast Thinker', color: 'bg-amber-100 text-amber-600' },
                  { icon: <Target size={20} />, label: 'Sniper', color: 'bg-emerald-100 text-emerald-600' },
                  { icon: <Brain size={20} />, label: 'Polymath', color: 'bg-indigo-100 text-indigo-600' },
                  { icon: <Flame size={20} />, label: 'On Fire', color: 'bg-rose-100 text-rose-600' },
                  { icon: <Clock size={20} />, label: 'Deep Focus', color: 'bg-purple-100 text-purple-600' },
                  { icon: <Award size={20} />, label: 'Top Tier', color: 'bg-blue-100 text-blue-600' },
                ].map((badge, i) => (
                  <div 
                    key={i}
                    className="aspect-square rounded-2xl bg-app-card border border-app-border flex flex-col items-center justify-center gap-2 p-2 group cursor-help"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${badge.color}`}>
                      {badge.icon}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-app-text-muted text-center leading-none">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
