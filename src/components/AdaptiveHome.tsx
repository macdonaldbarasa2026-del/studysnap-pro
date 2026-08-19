import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Brain, 
  Search, 
  Swords, 
  Plus, 
  Users, 
  Baby, 
  ArrowRight, 
  Zap, 
  Presentation, 
  Building2, 
  Clock, 
  Star, 
  Palette, 
  Menu, 
  Timer, 
  Microscope, 
  Sparkles, 
  LayoutDashboard, 
  Flame, 
  Calendar, 
  ChevronRight, 
  Target, 
  Activity, 
  Shield, 
  Video, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  Globe, 
  Server, 
  Beaker, 
  Network, 
  Cpu,
  Mic,
  Radio,
  Gamepad2,
  MoreHorizontal,
  MessageSquare,
  Camera as CameraIcon
} from 'lucide-react';
import { UserProfile, View, Subject, FocusStats, Theme } from '../types';
import { SmartStudyPlan } from './SmartStudyPlan';
import { LearningPathPanel } from './LearningPathPanel';
import { canUseCapability, canUseView, getModeDescription } from '../lib/featurePolicy';

interface AdaptiveHomeProps {
  userProfile: UserProfile | null;
  subjects: Subject[];
  stats: FocusStats;
  onViewChange: (view: View) => void;
  onMenuOpen: () => void;
  onThemePickerOpen: () => void;
  onAddSubject: () => void;
  onSelectSubject: (subject: Subject) => void;
  onFocusMode: () => void;
  themeName: Theme;
}

export const AdaptiveHome: React.FC<AdaptiveHomeProps> = ({
  userProfile,
  subjects,
  stats,
  onViewChange,
  onMenuOpen,
  onThemePickerOpen,
  onAddSubject,
  onSelectSubject,
  onFocusMode,
  themeName
}) => {
  const [activityStats, setActivityStats] = useState<Record<string, number>>({});
  const isRetro = (themeName as string) === 'retro';

  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem('studysnap-activity-stats') || '{}');
    setActivityStats(stats);
  }, []);

  const ageGroup = userProfile?.age_group || 'adult';
  const isBaby = ageGroup === 'baby';
  const isKid = ageGroup === 'kid';
  const isTeen = ageGroup === 'teen';
  const isAdult = ageGroup === 'adult';
  const role = userProfile?.role || 'student';
  const isTeachingRole = role === 'teacher' || role === 'lecturer';
  const isResearchRole = role === 'researcher';
  const isInstitutionRole = role === 'admin' || role === 'institution_owner';
  const isLearnerRole = role === 'student';
  const roleLabel = isTeachingRole ? 'Teaching mode' : isResearchRole ? 'Research mode' : isInstitutionRole ? 'Institution mode' : isBaby ? 'Early learning mode' : isKid ? 'Kids learning mode' : isTeen ? 'Teen learning mode' : 'Adult learning mode';
  const modeLabel = getModeDescription(userProfile);
  const privacyLabel = userProfile?.age_group !== 'adult' ? 'High privacy defaults' : 'Standard privacy defaults';
  const liveTutorEnabled = canUseCapability(userProfile, 'voice_tutor');

  // Featured actions are deliberately role/age aware. The app still contains the
  // full toolset, but Home prioritizes what this profile is most likely to need.
  const featuredActions = isBaby
    ? [
        { view: 'early-learning' as View, icon: <Baby />, title: 'Play & learn', subtitle: 'Early learning' },
        { view: 'voice-tutor' as View, icon: <Mic />, title: 'Talk to AI', subtitle: 'Friendly tutor' },
        { view: 'bites' as View, icon: <Zap />, title: 'Study Bites', subtitle: 'Tiny lessons' },
        { view: 'search' as View, icon: <Search />, title: 'Find notes', subtitle: 'Search your work' },
      ]
    : isTeachingRole
      ? [
          { view: 'teacher-insights' as View, icon: <Presentation />, title: 'Insights', subtitle: 'See learner gaps' },
          { view: 'live-classroom' as View, icon: <Video />, title: 'Live class', subtitle: 'Teach live' },
          { view: 'auto-note-builder' as View, icon: <FileText />, title: 'Build material', subtitle: 'Create resources' },
          { view: 'research-hub' as View, icon: <Microscope />, title: 'Research', subtitle: 'Go deeper' },
        ]
      : isResearchRole
        ? [
            { view: 'research-hub' as View, icon: <Microscope />, title: 'Research Hub', subtitle: 'Investigate topics' },
            { view: 'knowledge-map' as View, icon: <Network />, title: 'Knowledge Map', subtitle: 'Connect ideas' },
            { view: 'studysnap-ai' as View, icon: <Sparkles />, title: 'AI Study', subtitle: 'Analyze & create' },
            { view: 'search' as View, icon: <Search />, title: 'Find notes', subtitle: 'Search faster' },
          ]
        : isInstitutionRole
          ? [
              { view: 'institution-reports' as View, icon: <Building2 />, title: 'Reports', subtitle: 'Institution insights' },
              { view: 'institution-portal' as View, icon: <Building2 />, title: 'Network', subtitle: 'Manage education' },
              { view: 'events' as View, icon: <Calendar />, title: 'Events', subtitle: 'Academic events' },
              { view: 'notifications' as View, icon: <Activity />, title: 'Updates', subtitle: 'Stay informed' },
            ]
          : isTeen
            ? [
                { view: 'exam-simulator' as View, icon: <Timer />, title: 'Exam prep', subtitle: 'Simulate exams' },
                { view: 'revision-engine' as View, icon: <Brain />, title: 'Smart revision', subtitle: 'Review smarter' },
                { view: 'career-finder' as View, icon: <Target />, title: 'Career', subtitle: 'Explore paths' },
                { view: 'search' as View, icon: <Search />, title: 'Find notes', subtitle: 'Search faster' },
              ]
            : [
                { view: 'studysnap-ai' as View, icon: <Sparkles />, title: 'AI Study', subtitle: 'Ask & create' },
                { view: 'voice-tutor' as View, icon: <Mic />, title: 'Talk to AI', subtitle: 'Voice tutor' },
                { view: 'quiz' as View, icon: <Brain />, title: 'Practice', subtitle: 'Take a quiz' },
                { view: 'search' as View, icon: <Search />, title: 'Find notes', subtitle: 'Search faster' },
              ];

  const exploreTools = isBaby
    ? [
        ['early-learning', <Baby />, 'Play & Learn', 'Interactive activities'],
        ['videos', <Video />, 'Learning Videos', 'Songs and lessons'],
        ['voice-tutor', <Mic />, 'Talk to AI', 'Friendly tutor'],
        ['bites', <Zap />, 'Study Bites', 'Tiny lessons'],
      ]
    : isTeachingRole
      ? [
          ['teacher-insights', <Presentation />, 'Teacher Insights', 'See learning gaps'],
          ['live-classroom', <Video />, 'Live Classroom', 'Teach live'],
          ['auto-note-builder', <FileText />, 'Auto Note Builder', 'Build resources'],
          ['research-hub', <Microscope />, 'Research', 'Go deeper'],
          ['events', <Calendar />, 'Academic Events', 'Plan learning'],
          ['marketplace', <Globe />, 'Resource Marketplace', 'Share resources'],
        ]
      : isResearchRole
        ? [
            ['research-hub', <Microscope />, 'Research', 'Go deeper'],
            ['knowledge-map', <Network />, 'Knowledge Map', 'Connect ideas'],
            ['studysnap-ai', <Sparkles />, 'AI Studio', 'Analyze & create'],
            ['academic-timeline', <Activity />, 'Timeline', 'Track work'],
            ['search', <Search />, 'Search', 'Find notes'],
            ['bites', <Zap />, 'Study Bites', 'Quick lessons'],
          ]
        : isInstitutionRole
          ? [
              ['institution-portal', <Building2 />, 'Education Network', 'Manage the institution'],
              ['institution-reports', <Building2 />, 'Improvement Reports', 'See performance insights'],
              ['events', <Calendar />, 'Academic Events', 'Coordinate activities'],
              ['notifications', <Activity />, 'Updates', 'Stay informed'],
              ['academic-profile', <Users />, 'Academic Profiles', 'Review learner profiles'],
              ['research-hub', <Microscope />, 'Research', 'Explore evidence'],
            ]
          : isTeen
            ? [
                ['exam-simulator', <Timer />, 'Exam Simulator', 'Practice under pressure'],
                ['revision-engine', <Brain />, 'Smart Revision', 'Review smarter'],
                ['career-finder', <Target />, 'Career Finder', 'Explore pathways'],
                ['knowledge-battles', <Swords />, 'Knowledge Battles', 'Learn by competing'],
                ['live-classroom', <Video />, 'Live Classroom', 'Join a class'],
                ['search', <Search />, 'Search', 'Find notes'],
              ]
            : isKid
              ? [
                  ['learning-engine', <Sparkles />, 'Smart Learning', 'Personalized lessons'],
                  ['problem-solver', <Zap />, 'Problem Solver', 'Work through challenges'],
                  ['daily-challenges', <Flame />, 'Daily Challenges', 'Build a learning streak'],
                  ['voice-tutor', <Mic />, 'Voice Tutor', 'Ask for help'],
                  ['bites', <Zap />, 'Study Bites', 'Quick lessons'],
                  ['search', <Search />, 'Find Notes', 'Search your work'],
                ]
              : [
                  ['studysnap-ai', <Sparkles />, 'AI Study Studio', 'Ask, analyze & create'],
                  ['voice-tutor', <Mic />, 'AI Voice Tutor', 'Talk through a problem'],
                  ['revision-engine', <Brain />, 'Smart Revision', 'Review what matters'],
                  ['homework', <FileText />, 'Homework Helper', 'Solve a problem'],
                  ['research-hub', <Microscope />, 'Research Hub', 'Go deeper'],
                  ['search', <Search />, 'Search', 'Find notes'],
                ];

  // Determine Persona based on activity
  const getPersona = () => {
    const quizCount = activityStats['quiz'] || 0;
    const researchCount = activityStats['research'] || 0;
    const arenaCount = activityStats['arena'] || 0;
    const homeworkCount = activityStats['homework'] || 0;

    const max = Math.max(quizCount, researchCount, arenaCount, homeworkCount);
    if (max === 0) return 'general';
    if (max === quizCount) return 'practice';
    if (max === researchCount) return 'research';
    if (max === arenaCount) return 'competition';
    if (max === homeworkCount) return 'problem solving';
    return 'general';
  };

  const persona = getPersona();

  // Age-based styling
  const isDark = themeName === 'black' || themeName === 'midnight';
  const getThemeConfig = () => {
    switch(ageGroup) {
      case 'baby': return { 
        bg: isDark ? 'bg-app-bg' : 'bg-[#f0f9ff]', 
        card: 'rounded-[3rem]', 
        button: 'p-8 text-3xl font-black rounded-[4rem]',
        animation: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } }
      };
      case 'kid': return { 
        bg: isDark ? 'bg-app-bg' : 'bg-[#fffbeb]', 
        card: 'rounded-[2.5rem]', 
        button: 'p-6 text-xl font-bold rounded-[3rem]',
        animation: { y: [0, -5, 0], transition: { duration: 3, repeat: Infinity } }
      };
      case 'teen': return { 
        bg: isDark ? 'bg-app-bg' : 'bg-[#f5f3ff]', 
        card: 'rounded-[2rem]', 
        button: 'p-5 text-lg font-bold rounded-[2.5rem]',
        animation: {}
      };
      default: return { 
        bg: 'bg-app-bg', 
        card: 'rounded-[2rem]', 
        button: 'p-4 text-base font-semibold rounded-2xl',
        animation: {}
      };
    }
  };

  const theme = getThemeConfig();

  // Compact product shell: the default Home is intentionally short and task-focused.
  // Advanced functionality remains available through dedicated views, search, and the desktop sidebar.
  const primaryActions = isResearchRole
    ? [
        { view: 'research-hub' as View, icon: <Microscope />, title: 'Research', subtitle: 'Explore a topic' },
        { view: 'search' as View, icon: <Search />, title: 'Find something', subtitle: 'Search your work' },
        { view: 'studysnap-ai' as View, icon: <Sparkles />, title: 'Ask AI', subtitle: 'Analyze or create' },
      ]
    : isTeachingRole
      ? [
          { view: 'teacher-insights' as View, icon: <Presentation />, title: 'Insights', subtitle: 'See learning gaps' },
          { view: 'auto-note-builder' as View, icon: <FileText />, title: 'Build material', subtitle: 'Create resources' },
          { view: 'live-classroom' as View, icon: <Video />, title: 'Live class', subtitle: 'Teach or join' },
        ]
      : isInstitutionRole
        ? [
            { view: 'institution-reports' as View, icon: <Building2 />, title: 'Reports', subtitle: 'Review progress' },
            { view: 'events' as View, icon: <Calendar />, title: 'Events', subtitle: 'Plan academic work' },
            { view: 'search' as View, icon: <Search />, title: 'Find something', subtitle: 'Search your workspace' },
          ]
        : [
            { view: 'studysnap-ai' as View, icon: <Sparkles />, title: 'Ask StudySnap', subtitle: 'Get help instantly' },
            { view: 'scanner' as View, icon: <CameraIcon />, title: 'Scan notes', subtitle: 'Turn pages into study material' },
            { view: 'quiz' as View, icon: <Brain />, title: 'Practice', subtitle: 'Test what you know' },
          ];

  const visiblePrimaryActions = primaryActions.filter(action => canUseView(userProfile, action.view));

  const nextLabel = subjects.length === 0
    ? 'Add your first subject'
    : stats.notes === 0 && canUseView(userProfile, 'scanner')
      ? 'Create your first note'
      : stats.quizzes === 0 && canUseView(userProfile, 'quiz')
        ? 'Practice what you know'
        : 'Continue your study session';

  const nextAction = () => {
    if (subjects.length === 0) onAddSubject();
    else if (stats.notes === 0 && canUseView(userProfile, 'scanner')) onViewChange('scanner');
    else if (stats.quizzes === 0 && canUseView(userProfile, 'quiz')) onViewChange('quiz');
    else onFocusMode();
  };

  return (
    <div className="studysnap-content studysnap-home-v2 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8">
      <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold tracking-wide text-app-text-muted">{roleLabel}</p>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-app-bg border border-app-border text-app-text-muted">{modeLabel}</span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-app-bg border border-app-border text-app-text-muted">{privacyLabel}</span>
            {liveTutorEnabled && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-app-accent-soft text-app-accent">Voice ready</span>}
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-app-text truncate">
            Welcome{userProfile?.user_name ? `, ${userProfile.user_name}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onFocusMode} className="home-icon-button" aria-label="Start focus mode"><Timer size={19} /></button>
          <button type="button" onClick={onThemePickerOpen} className="home-icon-button" aria-label="Change theme"><Palette size={19} /></button>
        </div>
      </header>

      <section className="home-command" aria-labelledby="home-command-title">
        <div className="home-command-copy">
          <div className="home-kicker"><Sparkles size={14} /> StudySnap</div>
          <h2 id="home-command-title">What do you want to learn today?</h2>
          <p>Ask, scan, practice, or continue where you left off. StudySnap adapts to your learning style.</p>
        </div>
        <button type="button" onClick={() => onViewChange('studysnap-ai')} className="home-primary-button">
          <MessageSquare size={18} /> Ask StudySnap <ArrowRight size={17} />
        </button>
      </section>

      <section className="home-continue" aria-labelledby="home-continue-title">
        <div className="home-continue-copy">
          <div className="home-continue-icon"><Target size={19} /></div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-app-text-muted">Next best step</p>
            <h2 id="home-continue-title">{nextLabel}</h2>
            <p>{subjects.length ? `${subjects.length} learning area${subjects.length === 1 ? '' : 's'} in your workspace` : 'Create a learning area or jump straight into AI.'}</p>
          </div>
        </div>
        <button type="button" onClick={nextAction} className="home-secondary-button">Continue <ArrowRight size={16} /></button>
      </section>

      {/* USER-NEED FEATURE: deterministic daily study plan.
          This keeps the Home page useful even before the AI has enough history,
          while avoiding invented personalization or claims about performance. */}
      {!isBaby && (
        <SmartStudyPlan
          subjects={subjects}
          stats={stats}
          activityStats={activityStats}
          onViewChange={onViewChange}
          onFocusMode={onFocusMode}
        />
      )}

      {!isBaby && (
        <LearningPathPanel
          subjects={subjects}
          stats={stats}
          activityStats={activityStats}
          onViewChange={onViewChange}
        />
      )}

      <section className="mt-6" aria-labelledby="quick-actions-title">
        <div className="home-section-heading">
          <div><p className="text-xs font-semibold text-app-text-muted">Quick actions</p><h2 id="quick-actions-title">Start something</h2></div>
          <button type="button" className="home-text-button home-quick-actions-more" onClick={onMenuOpen}><MoreHorizontal size={15} /> More</button>
        </div>
        <div className="home-action-grid">
          {visiblePrimaryActions.map((action) => (
            <QuickAction key={action.view} onClick={() => onViewChange(action.view)} icon={action.icon} title={action.title} subtitle={action.subtitle} />
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="subjects-title">
        <div className="home-section-heading">
          <div><p className="text-xs font-semibold text-app-text-muted">Your workspace</p><h2 id="subjects-title">Learning areas</h2></div>
          <button type="button" className="home-text-button" onClick={onAddSubject}><Plus size={15} /> Add</button>
        </div>
        <div className="home-subject-row">
          {subjects.slice(0, 4).map((subject) => (
            <button key={subject.id} type="button" onClick={() => onSelectSubject(subject)} className="home-subject-card">
              <span className={`home-subject-icon ${subject.color}`}><BookOpen size={18} /></span>
              <span className="min-w-0"><strong>{subject.name}</strong><small>{isKid ? 'Lesson' : 'Learning area'}</small></span>
            </button>
          ))}
          {subjects.length > 4 && <button type="button" onClick={() => onViewChange('search')} className="home-subject-more">+{subjects.length - 4} more</button>}
          {subjects.length === 0 && <button type="button" onClick={onAddSubject} className="home-empty-state"><Plus size={18} /> Add a learning area</button>}
        </div>
      </section>

      {!isBaby && (
        <section className="home-progress mt-6" aria-label="Your progress">
          <div className="home-progress-heading"><div><p className="text-xs font-semibold text-app-text-muted">Your progress</p><h2>Keep your momentum</h2></div><Activity size={18} className="text-app-accent" /></div>
          <div className="home-stats-grid">
            <StatCard value={stats.notes} label={isKid ? 'Lessons' : 'Notes'} color="text-app-accent" />
            <StatCard value={stats.flashcards} label="Cards" color="text-violet-600" />
            <StatCard value={stats.quizzes} label="Quizzes" color="text-emerald-600" />
          </div>
        </section>
      )}

      <button type="button" onClick={onMenuOpen} className="home-tools-link mt-6">
        <span><MoreHorizontal size={18} /> Explore all StudySnap tools</span><ChevronRight size={17} />
      </button>
    </div>
  );
}

interface QuickActionProps { onClick: () => void; icon: React.ReactNode; title: string; subtitle: string; }

const QuickAction: React.FC<QuickActionProps> = ({ onClick, icon, title, subtitle }) => (
  <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className="min-h-20 rounded-2xl bg-app-card hover:bg-app-bg border border-app-border px-3 py-3 text-left flex items-center gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
    <span className="w-10 h-10 rounded-xl bg-app-accent-soft text-app-accent flex items-center justify-center shrink-0">{React.cloneElement(icon as React.ReactElement<any>, { size: 19 })}</span>
    <span className="min-w-0"><span className="block font-black text-sm truncate">{title}</span><span className="block text-[10px] text-app-text-muted font-semibold mt-0.5 line-clamp-2 leading-snug">{subtitle}</span></span>
  </motion.button>
);

interface ToolTileProps { onClick: () => void; icon: React.ReactNode; title: string; text: string; }

const ToolTile: React.FC<ToolTileProps> = ({ onClick, icon, title, text }) => (
  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClick} className="p-4 sm:p-5 min-h-28 rounded-3xl bg-app-card border border-app-border shadow-sm text-left group hover:border-app-accent/30 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
    <div className="w-10 h-10 rounded-2xl bg-app-bg text-app-accent flex items-center justify-center mb-3 group-hover:bg-app-accent group-hover:text-white transition-colors">{React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}</div>
    <h3 className="font-black text-app-text text-sm">{title}</h3>
    <p className="text-[10px] text-app-text-muted font-semibold mt-1">{text}</p>
  </motion.button>
);

interface StatCardProps {
  value: number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => (
  <div className={`bento-item bg-app-card card-shadow flex flex-col items-center justify-center text-center group border border-app-border`}>
    <div className={`text-3xl sm:text-5xl font-mono font-black ${color} mb-2 group-hover:scale-110 transition-transform duration-500 tabular-nums`}>
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-[9px] sm:text-[11px] font-black text-app-text-muted uppercase tracking-[0.2em]">{label}</div>
  </div>
);

interface ToolCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ onClick, icon, label }) => (
  <motion.button 
    whileHover={{ scale: 1.01, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-6 sm:p-8 rounded-3xl sm:rounded-[40px] bg-app-card border border-app-border text-app-text flex flex-col items-center justify-center gap-3 sm:gap-4 card-shadow group`}
  >
    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-app-bg group-hover:bg-app-accent/5 transition-colors">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, className: 'sm:size-7' })}
    </div>
    <span className="font-black text-xs sm:text-sm uppercase tracking-widest">{label}</span>
  </motion.button>
);
