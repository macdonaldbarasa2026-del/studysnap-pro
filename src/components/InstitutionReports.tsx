import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  ArrowLeft,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Globe,
  Award
} from 'lucide-react';
import { UserProfile, InstitutionReport as InstitutionReportType } from '../types';
import { downloadPdf } from '../utils/pdfExport';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface InstitutionReportsProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const InstitutionReports: React.FC<InstitutionReportsProps> = ({ userProfile, onBack }) => {
  const [report, setReport] = useState<InstitutionReportType | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!userProfile.institution_id) return;
      try {
        const res = await fetch(`/api/institution/report/${userProfile.institution_id}`);
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [userProfile.institution_id]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportReport = () => {
    if (!report) return;
    setIsExporting(true);
    try {
      const sections = [
        { heading: 'Institution', body: userProfile.institution_id || 'Not specified' },
        {
          heading: 'Subject Difficulty',
          body: report.subject_difficulty.length
            ? report.subject_difficulty.map(item => `${item.subject}: ${item.difficulty_score}`).join('\n')
            : 'No subject difficulty data available.'
        },
        {
          heading: 'Progress Trends',
          body: report.progress_trends.length
            ? report.progress_trends.map(item => `${item.date}: average score ${item.avg_score}`).join('\n')
            : 'No progress trend data available.'
        },
        {
          heading: 'Exam Preparation Status',
          body: report.exam_prep_status.length
            ? report.exam_prep_status.map(item => `${item.status}: ${item.count} students`).join('\n')
            : 'No exam preparation data available.'
        }
      ];
      downloadPdf({
        title: `${userProfile.institution_id} — StudySnap Improvement Report`,
        subtitle: `Generated ${new Date().toLocaleString()}`,
        sections
      }, `StudySnap-Institution-Report-${userProfile.institution_id}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!userProfile.institution_id) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-app-text">Institution Required</h2>
        <p className="text-app-text-muted">You must be part of an institution to view reports.</p>
        <button onClick={onBack} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-app-text">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-app-text">Institution Improvement Reports</h1>
            <p className="text-app-text-muted font-medium">Strategic data for campus growth</p>
          </div>
        </div>
        <button onClick={exportReport} disabled={isExporting || loading || !report} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Download size={20} />
          {isExporting ? 'Preparing…' : 'Export / Save PDF'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-app-card animate-pulse" />
          ))}
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-app-card border border-app-border">
              <div className="flex items-center gap-3 mb-2 text-indigo-600">
                <Building2 size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Institution</span>
              </div>
              <h3 className="text-xl font-black text-app-text truncate">{userProfile.institution_id}</h3>
              <p className="text-xs text-app-text-muted mt-1">Verified Campus</p>
            </div>
            <div className="p-6 rounded-3xl bg-app-card border border-app-border">
              <div className="flex items-center gap-3 mb-2 text-emerald-600">
                <Globe size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Global Rank</span>
              </div>
              <h3 className="text-xl font-black text-app-text">{report.progress_trends.length}</h3>
              <p className="text-xs text-app-text-muted mt-1">Progress data points</p>
            </div>
            <div className="p-6 rounded-3xl bg-app-card border border-app-border">
              <div className="flex items-center gap-3 mb-2 text-amber-600">
                <Award size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Excellence</span>
              </div>
              <h3 className="text-xl font-black text-app-text">{report.subject_difficulty.length}</h3>
              <p className="text-xs text-app-text-muted mt-1">Subjects analyzed</p>
            </div>
            <div className="p-6 rounded-3xl bg-app-card border border-app-border">
              <div className="flex items-center gap-3 mb-2 text-rose-600">
                <ShieldCheck size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Safety</span>
              </div>
              <h3 className="text-xl font-black text-app-text">{report.exam_prep_status.reduce((sum, item) => sum + item.count, 0)}</h3>
              <p className="text-xs text-app-text-muted mt-1">Students in exam-status data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Trends Chart */}
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-app-text">Student Progress Trends</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-app-text-muted bg-app-bg px-3 py-1 rounded-full">
                  <Calendar size={14} /> Last 7 Days
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.progress_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_score" 
                      stroke="#4f46e5" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Difficulty Chart */}
            <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <h3 className="text-xl font-black text-app-text mb-8">Subject Difficulty Levels</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.subject_difficulty} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="difficulty_score" radius={[0, 10, 10, 0]} barSize={20}>
                      {report.subject_difficulty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Exam Prep Status */}
            <div className="lg:col-span-1 p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
              <h3 className="text-xl font-black text-app-text mb-6">Exam Prep Status</h3>
              <div className="space-y-4">
                {report.exam_prep_status.map((status, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-app-bg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.status === 'detected' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="font-bold text-app-text capitalize">{status.status} Problems</span>
                    </div>
                    <span className="font-black text-app-text">{status.count}</span>
                  </div>
                ))}
                {report.exam_prep_status.length === 0 && (
                  <p className="text-center py-8 text-app-text-muted">No status data available.</p>
                )}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="lg:col-span-2 p-8 rounded-[40px] bg-slate-900 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-emerald-400" size={24} />
                <h3 className="text-xl font-black">Strategic Improvement Recommendations</h3>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-1">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Curriculum Adjustment</h4>
                    <p className="text-sm text-slate-400">
                      Subject difficulty data suggests that <span className="text-white font-medium">Mathematics</span> curriculum may need more foundational support in the first semester.
                    </p>
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-1">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Progress Acceleration</h4>
                    <p className="text-sm text-slate-400">
                      Recent trends show a <span className="text-white font-medium">15% increase</span> in student engagement after introducing gamified logic training. Recommend expanding this to all departments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <p className="text-app-text-muted">No report data available for this institution.</p>
        </div>
      )}
    </div>
  );
};

export default InstitutionReports;
