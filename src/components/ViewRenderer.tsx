import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { View, UserProfile, Subject, Note, Flashcard, FocusStats, Theme, SkillPassport } from '../types';
import { HomeView } from './views/HomeView';
import Scanner from './Scanner';
import { SubjectView } from './views/SubjectView';
import { NoteView } from './views/NoteView';
import { FlashcardsView } from './views/FlashcardsView';
import { QuizView } from './views/QuizView';
import { SearchView } from './views/SearchView';
import { ResearchView } from './views/ResearchView';
import { StudyRoomView } from './views/StudyRoomView';
import { SettingsView } from './views/SettingsView';
import { HelpView, AboutView, PoliciesView, FavoritesView, RecentNotesView, OfflineView, StatisticsView, ExportView, HomeworkView } from './views/OtherViews';
import { AgeSelector } from './AgeSelector';
import { EarlyLearningMode } from './EarlyLearningMode';
const KidsLearning = React.lazy(() => import('./KidsLearning').then(m => ({ default: m.KidsLearning ?? m.default })));
const VideosHub = React.lazy(() => import('./VideosHub'));
const CoachDashboard = React.lazy(() => import('./CoachDashboard'));
const Arena = React.lazy(() => import('./Arena'));
const LeagueDashboard = React.lazy(() => import('./LeagueDashboard'));
const HandwritingConverter = React.lazy(() => import('./HandwritingConverter').then(m => ({ default: m.HandwritingConverter })));
const VoiceTutor = React.lazy(() => import('./VoiceTutor'));
const RevisionEngine = React.lazy(() => import('./RevisionEngine'));
const DailyChallenges = React.lazy(() => import('./DailyChallenges'));
const ExamSimulator = React.lazy(() => import('./ExamSimulator'));
const DoubtSolver = React.lazy(() => import('./DoubtSolver'));
const CareerFinder = React.lazy(() => import('./CareerFinder'));
const ParentMode = React.lazy(() => import('./ParentMode'));
const Marketplace = React.lazy(() => import('./Marketplace'));
const AIStudyTwin = React.lazy(() => import('./AIStudyTwin').then(m => ({ default: m.AIStudyTwin })));
const LiveClassroom = React.lazy(() => import('./LiveClassroom').then(m => ({ default: m.LiveClassroom })));
const AutoNoteBuilder = React.lazy(() => import('./AutoNoteBuilder').then(m => ({ default: m.AutoNoteBuilder })));
const ErrorTracker = React.lazy(() => import('./ErrorTracker').then(m => ({ default: m.ErrorTracker ?? m.default })));
const AcademicTimeline = React.lazy(() => import('./AcademicTimeline').then(m => ({ default: m.AcademicTimeline ?? m.default })));
const KnowledgeBattles = React.lazy(() => import('./KnowledgeBattles').then(m => ({ default: m.KnowledgeBattles ?? m.default })));
const StudyBites = React.lazy(() => import('./StudyBites').then(m => ({ default: m.StudyBites })));
const KnowledgeAlchemy = React.lazy(() => import('./KnowledgeAlchemy').then(m => ({ default: m.KnowledgeAlchemy })));
const InstitutionPortal = React.lazy(() => import('./InstitutionPortal').then(m => ({ default: m.InstitutionPortal })));
const CampusMode = React.lazy(() => import('./CampusMode').then(m => ({ default: m.CampusMode })));
const WorkspaceSyncView = React.lazy(() => import('./WorkspaceSyncView').then(m => ({ default: m.WorkspaceSyncView })));
const ResearchHub = React.lazy(() => import('./ResearchHub').then(m => ({ default: m.ResearchHub })));
const NotificationCenter = React.lazy(() => import('./NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const AcademicEvents = React.lazy(() => import('./AcademicEvents').then(m => ({ default: m.AcademicEvents })));
const AcademicProfileView = React.lazy(() => import('./AcademicProfileView').then(m => ({ default: m.AcademicProfileView })));
const LearningEngine = React.lazy(() => import('./LearningEngine').then(m => ({ default: m.LearningEngine })));
const ReputationDashboard = React.lazy(() => import('./ReputationDashboard').then(m => ({ default: m.ReputationDashboard })));
const AcademicProblemSolver = React.lazy(() => import('./AcademicProblemSolver').then(m => ({ default: m.AcademicProblemSolver })));
const TeacherInsights = React.lazy(() => import('./TeacherInsights').then(m => ({ default: m.TeacherInsights })));
const InstitutionReports = React.lazy(() => import('./InstitutionReports').then(m => ({ default: m.InstitutionReports })));
const ChatsView = React.lazy(() => import('./views/NavigationViews').then(m => ({ default: m.ChatsView })));
const CommunitiesView = React.lazy(() => import('./views/NavigationViews').then(m => ({ default: m.CommunitiesView })));
const CallsView = React.lazy(() => import('./views/NavigationViews').then(m => ({ default: m.CallsView })));
import { LiveView } from './LiveView';
import ErrorBoundary from './ErrorBoundary';

import { ToastType } from './Toast';
import { canUseView, getModeDescription } from '../lib/featurePolicy';
import { StudySnapAIQuickAssist } from './StudySnapAIQuickAssist';

const KnowledgeMap = React.lazy(() => import('./KnowledgeMap').then(m => ({ default: m.KnowledgeMap })));
import { LoginView } from './LoginView';
import { AdminInspection } from './AdminInspection';
const StudySnapAI = React.lazy(() => import('./StudySnapAI').then(m => ({ default: m.StudySnapAI })));
const FileStudio = React.lazy(() => import('./FileStudio').then(m => ({ default: m.FileStudio })));

interface ViewRendererProps {
  view: View;
  setView: (view: View) => void;
  goBack: () => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  flashcards: Flashcard[];
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  fetchNotes: (subjectId: string) => void;
  fetchFlashcards: (noteId: string) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsThemePickerOpen: (isOpen: boolean) => void;
  setIsAddingSubject: (isOpen: boolean) => void;
  setIsFocusMode: (isOpen: boolean) => void;
  toggleFavorite: (note: Note) => void;
  toggleLock: (note: Note) => void;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsFlipped: (isFlipped: boolean) => void;
  isFlipped: boolean;
  currentCardIndex: number;
  startQuiz: (note: Note) => void;
  quizFinished: boolean;
  currentQuizIndex: number;
  quizQuestions: any[];
  quizScore: number;
  selectedOption: string | null;
  handleQuizAnswer: (option: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Note[];
  handleSearch: (query: string) => void;
  handleResearch: (query: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail?: string;
  authIsAnonymous?: boolean;
  messages: any[];
  onSendMessage: (msg: any) => void;
  setIsLive: (isLive: boolean) => void;
  setIsBroadcaster: (isBroadcaster: boolean) => void;
  setLiveRoomId: (roomId: string) => void;
  isLive: boolean;
  isBroadcaster: boolean;
  liveRoomId: string;
  focusStats: FocusStats;
  skillPassport: SkillPassport;
  getAnimationConfig: () => any;
  handleProfileSelect: (profile: UserProfile) => void;
  handleCapture?: (base64: string) => void;
  researchResult: any;
  previousView: View;
  currentRoom: any;
  setIsGameZoneOpen: (open: boolean) => void;
  toggleVoice: () => void;
  isVoiceEnabled: boolean;
  activeVoiceUsers: any[];
  roomTab: 'chat' | 'questions' | 'resources' | 'quiz' | 'settings';
  setRoomTab: (tab: 'chat' | 'questions' | 'resources' | 'quiz' | 'settings') => void;
  roomMessages: any[];
  postRoomQuestion: (q: string) => void;
  roomQuestions: any[];
  answerRoomQuestion: (id: string, a: string) => void;
  shareRoomResource: (title: string, type: string, content: string) => void;
  roomResources: any[];
  startGroupQuiz: () => void;
  roomQuizScores: any[];
  roomSettings: any;
  achievements: any[];
  sendRoomMessage: (msg: string) => void;
  updateRoomSettings: (settings: any) => void;
  theme: Theme;
  handleLogout: () => void;
  favoriteNotes: Note[];
  recentNotes: Note[];
  homeworkHelp: any;
  homeworkInput: string;
  setHomeworkInput: (val: string) => void;
  handleHomeworkHelp: (input: string, isImage?: boolean) => void;
  addToast: (message: string, type?: ToastType) => void;
  onInstallApp: () => void;
  onOpenQR?: () => void;
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  textSize: 'small' | 'normal' | 'large';
  setTextSize: (size: 'small' | 'normal' | 'large') => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const RouteLoading = () => (<div className="min-h-[100dvh] flex items-center justify-center bg-app-bg p-6"><div className="w-full max-w-sm rounded-3xl bg-app-card border border-app-border p-6 text-center shadow-sm"><div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-app-accent/10 animate-pulse" /><p className="font-black text-app-text">Opening StudySnap…</p><p className="text-sm text-app-text-muted mt-1">Preparing this learning space.</p></div></div>);

export const ViewRenderer: React.FC<ViewRendererProps> = (props) => {
  const {
    view,
    setView,
    goBack,
    userProfile,
    setUserProfile,
    subjects,
    setSubjects,
    notes,
    setNotes,
    flashcards,
    selectedSubject,
    setSelectedSubject,
    selectedNote,
    setSelectedNote,
    fetchNotes,
    fetchFlashcards,
    setIsMenuOpen,
    setIsThemePickerOpen,
    setIsAddingSubject,
    setIsFocusMode,
    toggleFavorite,
    toggleLock,
    setCurrentCardIndex,
    setIsFlipped,
    isFlipped,
    currentCardIndex,
    startQuiz,
    quizFinished,
    currentQuizIndex,
    quizQuestions,
    quizScore,
    selectedOption,
    handleQuizAnswer,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    handleResearch,
    userName,
    setUserName,
    messages,
    onSendMessage,
    setIsLive,
    setIsBroadcaster,
    setLiveRoomId,
    isLive,
    isBroadcaster,
    liveRoomId,
    focusStats,
    skillPassport,
    getAnimationConfig,
    handleProfileSelect,
    handleCapture,
    researchResult,
    previousView,
    currentRoom,
    setIsGameZoneOpen,
    toggleVoice,
    isVoiceEnabled,
    activeVoiceUsers,
    roomTab,
    setRoomTab,
    roomMessages,
    postRoomQuestion,
    roomQuestions,
    answerRoomQuestion,
    shareRoomResource,
    roomResources,
    startGroupQuiz,
    roomQuizScores,
    roomSettings,
    achievements,
    sendRoomMessage,
    updateRoomSettings,
    theme,
    handleLogout,
    favoriteNotes,
    recentNotes,
    homeworkHelp,
    homeworkInput,
    setHomeworkInput,
    handleHomeworkHelp,
    addToast,
    onInstallApp,
    onOpenQR,
    canInstall,
    isStandalone,
    isIOS,
    textSize,
    setTextSize,
    notificationsEnabled,
    setNotificationsEnabled,
    userEmail,
    authIsAnonymous
  } = props;

  const [phoneDraft, setPhoneDraft] = useState(userProfile?.phone || '');
  React.useEffect(() => { setPhoneDraft(userProfile?.phone || ''); }, [userProfile?.phone]);

  if (userProfile && !canUseView(userProfile, view) && !['login', 'onboarding', 'age-selection', 'role-selection'].includes(view)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-app-bg p-6">
        <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-card p-7 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center text-xl font-black">✓</div>
          <h1 className="mt-4 text-xl font-black text-app-text">Feature not available in this mode</h1>
          <p className="mt-2 text-sm text-app-text-muted">StudySnap has automatically limited this area for <span className="font-bold text-app-text">{getModeDescription(userProfile)}</span> and the selected age group.</p>
          <button onClick={() => setView('home')} className="mt-6 w-full rounded-2xl bg-app-accent text-white py-3 font-black">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div key="login" {...getAnimationConfig()}>
            <LoginView onLoginSuccess={() => setView('onboarding')} />
          </motion.div>
        )}

        {view === 'onboarding' && (
          <motion.div key="onboarding" {...getAnimationConfig()} className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-neutral-50">
            <div className="fixed top-[calc(10px+var(--safe-top))] left-1/2 -translate-x-1/2 flex gap-2 z-50">
              <div className="h-1.5 w-8 rounded-full bg-indigo-600" />
              <div className="h-1.5 w-2 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-2 rounded-full bg-neutral-200" />
            </div>
            <div className="w-full max-w-md p-10 bg-white rounded-[48px] shadow-2xl shadow-indigo-100/50 border border-indigo-50">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8">
                <Sparkles size={40} />
              </div>
              <h2 className="text-4xl font-black mb-2 text-app-text tracking-tight">Welcome!</h2>
              <p className="text-app-text-muted font-bold text-sm mb-6 uppercase tracking-widest">Use your real name and contact details</p>
              {authIsAnonymous && <div className="mb-5 p-4 rounded-2xl bg-amber-50 text-amber-800 text-sm font-bold">A verified account is required for a full StudySnap profile. Please sign in with Google or Apple first.</div>}
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 text-sm"><span className="font-bold">Email:</span> {userEmail || 'Not available'}</div>
              
              <div className="relative mb-4">
                <input 
                  type="text" 
                  autoFocus
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    localStorage.setItem('studysnap-username', e.target.value);
                  }}
                  className="w-full p-6 text-xl font-bold rounded-3xl bg-neutral-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-neutral-300"
                  placeholder="Your full legal name..."
                />
              </div>
              <div className="relative mb-8">
                <input type="tel" inputMode="tel" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} className="w-full p-6 text-xl font-bold rounded-3xl bg-neutral-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none" placeholder="Your phone number..." />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={!userName.trim() || !phoneDraft.trim() || !!authIsAnonymous}
                onClick={() => setView('age-selection')}
                className="w-full p-6 rounded-3xl bg-indigo-600 text-white font-black text-lg shadow-xl shadow-indigo-200 disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3"
              >
                Continue <ArrowRight size={24} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {view === 'age-selection' && (
          <motion.div key="age-selection" {...getAnimationConfig()} className="min-h-[100dvh] bg-neutral-50">
            <div className="fixed top-[calc(10px+var(--safe-top))] left-1/2 -translate-x-1/2 flex gap-2 z-50">
              <div className="h-1.5 w-2 rounded-full bg-indigo-600/30" />
              <div className="h-1.5 w-8 rounded-full bg-indigo-600" />
              <div className="h-1.5 w-2 rounded-full bg-neutral-200" />
            </div>
            <AgeSelector 
              userName={userName} 
              onSelect={(ageGroup) => {
                const newProfile: UserProfile = { 
                  user_name: userName,
                  age_group: ageGroup,
                  sound_enabled: true,
                  parental_lock: false,
                  role: 'student',
                  email: userEmail,
                  phone: phoneDraft.trim(),
                  reputation_score: 0,
                  reputation_level: 'learner',
                  followers_count: 0,
                  following_count: 0,
                  subscribers_count: 0,
                  bio: '',
                  description: '',
                  personal_venues: [],
                  screen_time_limit: 0,
                  parental_pin: crypto.randomUUID().replace(/-/g, '').slice(0, 6),
                  can_go_live: false,
                  avatar_filter_enabled: true
                };
                setUserProfile(newProfile);
                setView('role-selection');
              }} 
            />
          </motion.div>
        )}

        {view === 'role-selection' && (
          <motion.div key="role-selection" {...getAnimationConfig()} className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-neutral-50">
            <div className="fixed top-[calc(10px+var(--safe-top))] left-1/2 -translate-x-1/2 flex gap-2 z-50">
              <div className="h-1.5 w-2 rounded-full bg-indigo-600/30" />
              <div className="h-1.5 w-2 rounded-full bg-indigo-600/30" />
              <div className="h-1.5 w-8 rounded-full bg-indigo-600" />
            </div>
            <div className="w-full max-w-md p-10 bg-white rounded-[48px] shadow-2xl shadow-indigo-100/50 border border-indigo-50">
              <h2 className="text-3xl font-black mb-2 text-app-text tracking-tight">Final Step</h2>
              <p className="text-app-text-muted font-bold text-sm mb-10 uppercase tracking-widest">Choose your role</p>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'student', label: 'Student', desc: 'I want to learn and grow', minAge: 'baby' },
                  { id: 'teacher', label: 'Teacher', desc: 'I teach learners', minAge: 'adult' },
                  { id: 'institution_owner', label: 'Institution Owner', desc: 'I manage an education institution', minAge: 'adult' },
                  { id: 'lecturer', label: 'Lecturer', desc: 'I teach advanced subjects', minAge: 'adult' },
                  { id: 'researcher', label: 'Researcher', desc: 'I conduct academic research', minAge: 'adult' },
                  { id: 'admin', label: 'Admin', desc: 'Platform administration (verified only)', minAge: 'adult' }
                ].filter(role => userProfile?.age_group === 'adult' || role.id === 'student').map(role => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const selectedRole = role.id as UserProfile['role'];
                      const profile: UserProfile = {
                        ...userProfile!,
                        role: selectedRole === 'student' ? 'student' : 'student',
                        requested_role: selectedRole === 'student' ? undefined : selectedRole as UserProfile['requested_role'],
                        institution_id: undefined
                      };
                      handleProfileSelect(profile);
                    }}
                    className="p-6 rounded-[32px] border-2 border-neutral-50 bg-neutral-50 hover:border-indigo-500 hover:bg-white transition-all text-left group"
                  >
                    <div className="font-black text-app-text text-lg capitalize mb-1 group-hover:text-indigo-600 transition-colors">{role.label}</div>
                    <div className="text-app-text-muted text-xs font-bold">{role.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'kids-learning' && <motion.div key="kids-learning" {...getAnimationConfig()}><KidsLearning onBack={goBack} /></motion.div>}
        {view === 'videos' && <motion.div key="videos" {...getAnimationConfig()}><VideosHub age={userProfile?.age_group ?? 'kid'} onBack={goBack} onCreate={() => setView('scanner')} /></motion.div>}
        {view === 'scanner' && <motion.div key="scanner" {...getAnimationConfig()}><Scanner onCapture={props.handleCapture ?? (() => {})} onClose={goBack} /></motion.div>}
        {view === 'early-learning' && (
          <motion.div
            key="early-learning"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative min-h-[100dvh] w-full overflow-hidden"
          >
            <EarlyLearningMode onExit={goBack} />
          </motion.div>
        )}

        {view === 'home' && <motion.div key="home" {...getAnimationConfig()}>
          <HomeView 
            userProfile={userProfile}
            subjects={subjects}
            stats={focusStats}
            setView={setView}
            setIsMenuOpen={setIsMenuOpen}
            setIsThemePickerOpen={setIsThemePickerOpen}
            setIsAddingSubject={setIsAddingSubject}
            setSelectedSubject={setSelectedSubject}
            fetchNotes={fetchNotes}
            setIsFocusMode={setIsFocusMode}
            theme={theme}
          />
        </motion.div>}

        {view === 'subject' && <motion.div key="subject" {...getAnimationConfig()}>
          <SubjectView 
            selectedSubject={selectedSubject}
            notes={notes}
            setView={setView}
            onBack={goBack}
            setSelectedNote={setSelectedNote}
          />
        </motion.div>}

        {view === 'note' && <motion.div key="note" {...getAnimationConfig()}>
          <NoteView 
            selectedNote={selectedNote}
            setView={setView}
            toggleFavorite={toggleFavorite}
            toggleLock={toggleLock}
            fetchFlashcards={fetchFlashcards}
            setCurrentCardIndex={setCurrentCardIndex}
            setIsFlipped={setIsFlipped}
            startQuiz={startQuiz}
            handleResearch={handleResearch}
            userProfile={userProfile}
          />
        </motion.div>}

        {view === 'flashcards' && <motion.div key="flashcards" {...getAnimationConfig()}>
          <FlashcardsView 
            selectedNote={selectedNote}
            flashcards={flashcards}
            currentCardIndex={currentCardIndex}
            isFlipped={isFlipped}
            setView={setView}
            setIsFlipped={setIsFlipped}
            setCurrentCardIndex={setCurrentCardIndex}
          />
        </motion.div>}

        {view === 'quiz' && <motion.div key="quiz" {...getAnimationConfig()}>
          <QuizView 
            selectedNote={selectedNote}
            quizFinished={quizFinished}
            currentQuizIndex={currentQuizIndex}
            quizQuestions={quizQuestions}
            quizScore={quizScore}
            selectedOption={selectedOption}
            setView={setView}
            handleQuizAnswer={handleQuizAnswer}
          />
        </motion.div>}

        {view === 'search' && <motion.div key="search" {...getAnimationConfig()}>
          <SearchView 
            searchQuery={searchQuery}
            searchResults={searchResults}
            setView={setView}
            onBack={goBack}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            handleResearch={handleResearch}
            setSelectedNote={setSelectedNote}
          />
        </motion.div>}

        {view === 'research' && <motion.div key="research" {...getAnimationConfig()}><ResearchView researchResult={researchResult} previousView={previousView} setView={setView} /></motion.div>}
        {view === 'dashboard' && <motion.div key="dashboard" {...getAnimationConfig()}><CoachDashboard userName={userName || 'Student'} subjects={subjects} onBack={goBack} /></motion.div>}
        {view === 'settings' && <motion.div key="settings" {...getAnimationConfig()}><SettingsView setView={setView} setIsThemePickerOpen={setIsThemePickerOpen} theme={theme} userProfile={userProfile} setUserProfile={setUserProfile} handleLogout={handleLogout} onInstallApp={onInstallApp} onOpenQR={onOpenQR} canInstall={canInstall} isStandalone={isStandalone} isIOS={isIOS} textSize={textSize} setTextSize={setTextSize} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} /></motion.div>}
        {view === 'help' && <motion.div key="help" {...getAnimationConfig()}><HelpView setView={setView} /></motion.div>}
        {view === 'about' && <motion.div key="about" {...getAnimationConfig()}><AboutView setView={setView} /></motion.div>}
        {view === 'policies' && <motion.div key="policies" {...getAnimationConfig()}><PoliciesView setView={setView} /></motion.div>}
        {view === 'favorites' && <motion.div key="favorites" {...getAnimationConfig()}><FavoritesView setView={setView} favoriteNotes={favoriteNotes} setSelectedNote={setSelectedNote} /></motion.div>}
        {view === 'offline' && <motion.div key="offline" {...getAnimationConfig()}><OfflineView setView={setView} subjects={subjects} /></motion.div>}
        {view === 'statistics' && <motion.div key="statistics" {...getAnimationConfig()}><StatisticsView setView={setView} /></motion.div>}
        {view === 'export' && <motion.div key="export" {...getAnimationConfig()}><ExportView setView={setView} /></motion.div>}
        {view === 'recent' && <motion.div key="recent" {...getAnimationConfig()}><RecentNotesView setView={setView} recentNotes={recentNotes} setSelectedNote={setSelectedNote} /></motion.div>}
        {view === 'homework' && <motion.div key="homework" {...getAnimationConfig()}><HomeworkView setView={setView} homeworkHelp={homeworkHelp} homeworkInput={homeworkInput} setHomeworkInput={setHomeworkInput} handleHomeworkHelp={handleHomeworkHelp} previousView={previousView} /></motion.div>}
        {view === 'studyroom' && <motion.div key="studyroom" {...getAnimationConfig()}><StudyRoomView currentRoom={currentRoom} setView={setView} setIsGameZoneOpen={setIsGameZoneOpen} toggleVoice={toggleVoice} isVoiceEnabled={isVoiceEnabled} activeVoiceUsers={activeVoiceUsers} roomTab={roomTab} setRoomTab={setRoomTab} roomMessages={roomMessages} userName={userName} postRoomQuestion={postRoomQuestion} roomQuestions={roomQuestions} answerRoomQuestion={answerRoomQuestion} selectedNote={selectedNote} shareRoomResource={shareRoomResource} roomResources={roomResources} setSelectedNote={setSelectedNote} startGroupQuiz={startGroupQuiz} roomQuizScores={roomQuizScores} roomSettings={roomSettings} achievements={achievements} sendRoomMessage={sendRoomMessage} updateRoomSettings={updateRoomSettings} /></motion.div>}
        {view === 'arena' && <motion.div key="arena" {...getAnimationConfig()}><Arena userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'league' && <motion.div key="league" {...getAnimationConfig()}><LeagueDashboard userName={userName || 'Student'} userProfile={userProfile} onBack={goBack} onJoinMatch={(isLeague) => { setView('arena'); }} /></motion.div>}
        {view === 'handwriting-converter' && <motion.div key="handwriting-converter" {...getAnimationConfig()}><HandwritingConverter onBack={goBack} addToast={addToast} /></motion.div>}
        {view === 'voice-tutor' && <motion.div key="voice-tutor" {...getAnimationConfig()}><VoiceTutor userName={userName || 'Student'} onBack={goBack} addToast={addToast} /></motion.div>}
        {view === 'revision-engine' && <motion.div key="revision-engine" {...getAnimationConfig()}><RevisionEngine userName={userName || 'Student'} notes={notes} flashcards={flashcards} onBack={goBack} onReviewNote={(note) => { setSelectedNote(note); setView('note'); }} onReviewFlashcards={(noteId) => { setView('flashcards'); }} /></motion.div>}
        {view === 'daily-challenges' && <motion.div key="daily-challenges" {...getAnimationConfig()}><DailyChallenges userName={userName || 'Student'} stats={focusStats} onBack={goBack} onStartTask={(type) => {
          if (type === 'quiz' || type === 'flashcard' || type === 'game') setView('arena');
          else if (type === 'note') setView('home');
        }} /></motion.div>}
        {view === 'exam-simulator' && <motion.div key="exam-simulator" {...getAnimationConfig()}><ExamSimulator userName={userName || 'Student'} subjects={subjects} notes={notes} onBack={goBack} /></motion.div>}
        {view === 'doubt-solver' && <motion.div key="doubt-solver" {...getAnimationConfig()}><DoubtSolver userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'career-finder' && <motion.div key="career-finder" {...getAnimationConfig()}><CareerFinder userProfile={userProfile} skillPassport={skillPassport} onBack={goBack} /></motion.div>}
        {view === 'parent-mode' && <motion.div key="parent-mode" {...getAnimationConfig()}><ParentMode userProfile={userProfile} stats={focusStats} onBack={goBack} onUpdateLimit={(limit) => setUserProfile(prev => prev ? {...prev, screen_time_limit: limit} : null)} onUpdatePermissions={(canGoLive, avatarFilter) => setUserProfile(prev => prev ? {...prev, can_go_live: canGoLive, avatar_filter_enabled: avatarFilter} : null)} onUpdatePin={(pin) => setUserProfile(prev => prev ? {...prev, parental_pin: pin, parental_pin_updated_at: new Date().toISOString()} : null)} /></motion.div>}
        {view === 'marketplace' && <motion.div key="marketplace" {...getAnimationConfig()}><Marketplace userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'ai-study-twin' && <motion.div key="ai-study-twin" {...getAnimationConfig()}><AIStudyTwin userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'live-classroom' && <motion.div key="live-classroom" {...getAnimationConfig()}><LiveClassroom userName={userName || 'Student'} onBack={goBack} initialIsCallActive={isLive} addToast={addToast} roomId={liveRoomId || 'general'} userProfile={userProfile || { 
          user_name: userName || 'Student', 
          age_group: 'kid', 
          role: 'student', 
          reputation_score: 0, 
          reputation_level: 'learner', 
          followers_count: 0, 
          following_count: 0, 
          subscribers_count: 0, 
          can_go_live: false, 
          avatar_filter_enabled: true,
          sound_enabled: true,
          parental_lock: false
        }} /></motion.div>}
        {view === 'auto-note-builder' && (
          <motion.div key="auto-note-builder" {...getAnimationConfig()}>
            <AutoNoteBuilder 
              onBack={goBack} 
              onSave={(newNote) => {
                const note: Note = {
                  id: Date.now().toString(),
                  subject_id: subjects[0]?.id || 'general',
                  title: newNote.title,
                  content: newNote.content,
                  summary: newNote.summary,
                  created_at: new Date().toISOString(),
                  is_favorite: false
                };
                setNotes([note, ...notes]);
                setView('home');
              }} 
            />
          </motion.div>
        )}
        {view === 'error-tracker' && (
          <motion.div key="error-tracker" {...getAnimationConfig()}>
            <ErrorTracker 
              userName={userName || 'Student'} 
              onBack={goBack} 
              onStartRevision={(topic) => {
                console.log(`Starting revision for ${topic}`);
                setView('quiz');
              }} 
            />
          </motion.div>
        )}
        {view === 'academic-timeline' && <motion.div key="academic-timeline" {...getAnimationConfig()}><AcademicTimeline userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'knowledge-battles' && <motion.div key="knowledge-battles" {...getAnimationConfig()}><KnowledgeBattles userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'bites' && <motion.div key="bites" {...getAnimationConfig()}><StudyBites userName={userName || 'Student'} onBack={goBack} /></motion.div>}
        {view === 'alchemy' && (
          <motion.div key="alchemy" {...getAnimationConfig()}>
            <KnowledgeAlchemy 
              subjects={subjects} 
              onBack={goBack} 
              onSaveHybrid={(note) => {
                setNotes([note, ...notes]);
                setView('home');
                addToast("Hybrid note saved to Grimoire!", "success");
              }} 
              addToast={addToast}
            />
          </motion.div>
        )}
        {view === 'institution-portal' && <motion.div key="institution-portal" {...getAnimationConfig()}><InstitutionPortal userName={userName} role={userProfile?.role} onBack={goBack} /></motion.div>}
        {view === 'campus' && <motion.div key="campus" {...getAnimationConfig()}><CampusMode userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'workspace-sync' && <motion.div key="workspace-sync" {...getAnimationConfig()}><WorkspaceSyncView onBack={goBack} /></motion.div>}
        {view === 'research-hub' && <motion.div key="research-hub" {...getAnimationConfig()}><ResearchHub userProfile={userProfile} onBack={goBack} addToast={addToast} /></motion.div>}
        {view === 'notifications' && <motion.div key="notifications" {...getAnimationConfig()}><NotificationCenter userName={userName} onBack={goBack} /></motion.div>}
        {view === 'events' && <motion.div key="events" {...getAnimationConfig()}><AcademicEvents userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'academic-profile' && userProfile && (
          <motion.div key="academic-profile" {...getAnimationConfig()}>
            <AcademicProfileView 
              userProfile={userProfile} 
              onBack={goBack} 
              onUpdateProfile={(updated) => setUserProfile(updated)}
            />
          </motion.div>
        )}
        {view === 'learning-engine' && <motion.div key="learning-engine" {...getAnimationConfig()}><LearningEngine userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'reputation' && <motion.div key="reputation" {...getAnimationConfig()}><ReputationDashboard userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'problem-solver' && <motion.div key="problem-solver" {...getAnimationConfig()}><AcademicProblemSolver userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'teacher-insights' && <motion.div key="teacher-insights" {...getAnimationConfig()}><TeacherInsights userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'institution-reports' && <motion.div key="institution-reports" {...getAnimationConfig()}><InstitutionReports userProfile={userProfile} onBack={goBack} /></motion.div>}
        {view === 'chats' && <motion.div key="chats" {...getAnimationConfig()}><ChatsView messages={messages} userName={userName} onBack={goBack} onSendMessage={onSendMessage} /></motion.div>}
        {view === 'updates' && <motion.div key="updates" {...getAnimationConfig()}><NotificationCenter userName={userName} onBack={goBack} /></motion.div>}
        {view === 'communities' && <motion.div key="communities" {...getAnimationConfig()}><CommunitiesView onBack={goBack} onGoLive={() => { setIsLive(true); setIsBroadcaster(true); setLiveRoomId('room1'); }} messages={messages} userName={userName} onSendMessage={onSendMessage} /></motion.div>}
        {view === 'calls' && <motion.div key="calls" {...getAnimationConfig()}><CallsView onBack={goBack} /></motion.div>}
        {isLive && (
          <LiveView 
            userName={userName} 
            isBroadcaster={isBroadcaster} 
            roomId={liveRoomId} 
            onBack={() => setIsLive(false)} 
          />
        )}
        {view === 'knowledge-map' && (
          <motion.div key="knowledge-map" {...getAnimationConfig()}>
            <KnowledgeMap subjects={subjects} notes={notes} onBack={goBack} />
          </motion.div>
        )}
        {view === 'admin-inspection' && (
          <motion.div key="admin-inspection" {...getAnimationConfig()}>
            <AdminInspection userProfile={userProfile} onBack={goBack} addToast={addToast} />
          </motion.div>
        )}
        {view === 'file-studio' && (
          <motion.div key="file-studio" {...getAnimationConfig()}>
            <FileStudio onBack={goBack} addToast={addToast} userProfile={userProfile} />
          </motion.div>
        )}
        {view === 'studysnap-ai' && (
          <motion.div key="studysnap-ai" {...getAnimationConfig()}>
            <StudySnapAI onBack={goBack} addToast={addToast} userProfile={userProfile} />
          </motion.div>
        )}
      </AnimatePresence>

      {userProfile && canUseView(userProfile, 'studysnap-ai') && !['login', 'onboarding', 'age-selection', 'role-selection', 'studysnap-ai'].includes(view) && (
        <StudySnapAIQuickAssist
          view={view}
          userProfile={userProfile}
          selectedNote={selectedNote}
          selectedSubject={selectedSubject}
          onOpenFullAI={() => setView('studysnap-ai')}
          addToast={addToast}
        />
      )}
      </Suspense>
    </ErrorBoundary>
  );
};
