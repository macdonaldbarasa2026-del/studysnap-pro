import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Camera as CameraIcon, 
  ChevronLeft, 
  MoreVertical, 
  FileText, 
  Type,
  Brain, 
  Layers, 
  Trash2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Menu,
  Palette,
  Sun,
  Moon,
  Coffee,
  Sparkles,
  X,
  LayoutDashboard,
  Clock,
  Star,
  DownloadCloud,
  BarChart3,
  Share2,
  Settings,
  HelpCircle as QuestionIcon,
  Info,
  Users,
  MessageSquare,
  Send,
  Trophy,
  FileUp,
  User,
  Mic,
  MicOff,
  Volume2,
  Zap,
  Cpu,
  Timer,
  Swords,
  Baby,
  Lock as LockIcon,
  School,
  Building2,
  GraduationCap,
  Microscope,
  Globe,
  Mic2,
  Presentation,
  Video,
  Bell,
  Calendar,
  Flame,
  Compass,
  ShoppingBag,
  Download,
  Shield,
  QrCode,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileQRCodeModal } from './components/MobileQRCodeModal';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { OfflineActivitiesHub } from './components/OfflineActivitiesHub';
import { Subject, Note, Flashcard, View, Theme, ResearchResult, HomeworkHelp, StudyRoom, RoomMessage, RoomQuestion, RoomResource, RoomSettings, Achievement, UserProfile, AgeGroup, AppNotification, Institution, Department, Course, ResearchProject, AcademicEvent, FocusStats, SkillPassport } from './types';
import { BottomNavigation } from './components/BottomNavigation';
import Scanner from './components/Scanner';
import { performOCR, generateSummary, generateFlashcards, generateQuiz, performWebSearch, generateHomeworkHelp } from './services/gemini';
import ReactMarkdown from 'react-markdown';
import { AgeSelector } from './components/AgeSelector';
import { EarlyLearningMode } from './components/EarlyLearningMode';
import GameZone from './components/GameZone';
import Arena from './components/Arena';
import LeagueDashboard from './components/LeagueDashboard';
import { HandwritingConverter } from './components/HandwritingConverter';
import VoiceTutor from './components/VoiceTutor';
import RevisionEngine from './components/RevisionEngine';
import DailyChallenges from './components/DailyChallenges';
import ExamSimulator from './components/ExamSimulator';
import DoubtSolver from './components/DoubtSolver';
import CareerFinder from './components/CareerFinder';
import ParentMode from './components/ParentMode';
import Marketplace from './components/Marketplace';
import CoachDashboard from './components/CoachDashboard';
import { InstitutionPortal } from './components/InstitutionPortal';
import { CampusMode } from './components/CampusMode';
import { ResearchHub } from './components/ResearchHub';
import { NotificationCenter } from './components/NotificationCenter';
import { AcademicEvents } from './components/AcademicEvents';
import { AcademicProfileView } from './components/AcademicProfileView';
import { LearningEngine } from './components/LearningEngine';
import { ReputationDashboard } from './components/ReputationDashboard';
import { AcademicProblemSolver } from './components/AcademicProblemSolver';
import { TeacherInsights } from './components/TeacherInsights';
import { InstitutionReports } from './components/InstitutionReports';
import { AdaptiveHome } from './components/AdaptiveHome';
import { FocusMode } from './components/FocusMode';
import { AIStudyTwin } from './components/AIStudyTwin';
import { LiveClassroom } from './components/LiveClassroom';
import { AutoNoteBuilder } from './components/AutoNoteBuilder';
import { ViewRenderer } from './components/ViewRenderer';
import { HomeView } from './components/views/HomeView';
import { SubjectView } from './components/views/SubjectView';
import { NoteView } from './components/views/NoteView';
import { FlashcardsView } from './components/views/FlashcardsView';
import { QuizView } from './components/views/QuizView';
import { SearchView } from './components/views/SearchView';
import { LiveView } from './components/LiveView';
import CountryContactModal, { StudySnapContact } from './components/CountryContactModal';
import { ChatsView, CommunitiesView, CallsView } from './components/views/NavigationViews';
import { ErrorTracker } from './components/ErrorTracker';
import { AcademicTimeline } from './components/AcademicTimeline';
import { KnowledgeBattles } from './components/KnowledgeBattles';
import { StudyBites } from './components/StudyBites';
import { CommandPalette } from './components/CommandPalette';
import { NeuralPulse } from './components/NeuralPulse';
import { NativeBoot } from './components/NativeBoot';
import { NativeBridge } from './components/NativeBridge';
import { NeuralEngine } from './lib/neural_engine';

import { ToastContainer, ToastType } from './components/Toast';
import { auth, onAuthStateChanged, User as FirebaseUser } from './lib/firebase';
import { DataService } from './services/dataService';
import { hapticClick, hapticSuccess, hapticError } from './lib/haptics';
import { canUseView } from './lib/featurePolicy';
import { detectPlatform } from './lib/deviceLayout';

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-orange-500'
];

export default function App() {
  const [view, setViewState] = useState<View>(() => {
    // Check if we are deep-linked to a specific view
    const params = new URLSearchParams(window.location.search);
    if (params.has('studysnap-call')) return 'calls';
    return 'login';
  });

  // Give the web/PWA shell a stable platform signal so components can use
  // familiar platform conventions without duplicating the application logic.
  useEffect(() => {
    document.documentElement.dataset.platform = detectPlatform();
    document.documentElement.dataset.formFactor = window.innerWidth < 768 ? 'phone' : window.innerWidth < 1200 ? 'tablet' : 'desktop';
    const onResize = () => {
      document.documentElement.dataset.formFactor = window.innerWidth < 768 ? 'phone' : window.innerWidth < 1200 ? 'tablet' : 'desktop';
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const userProfileRef = React.useRef<UserProfile | null>(null);
  const navigationStackRef = React.useRef<View[]>(['login']);
  const navigationReadyRef = React.useRef(false);
  const setView = React.useCallback((nextView: View) => {
    setViewState(current => {
      if (current === nextView) return current;
      navigationStackRef.current = [...navigationStackRef.current, nextView].slice(-30);
      if (navigationReadyRef.current) window.history.pushState({ studysnap: true }, '');
      return nextView;
    });
  }, []);

  // Global event listener for Voice AI App Control
  useEffect(() => {
    const handleVoiceCommand = (e: CustomEvent) => {
      const target = e.detail?.view;
      if (e.detail?.action !== 'navigate' || typeof target !== 'string') return;
      const profile = userProfileRef.current;
      if (profile && !canUseView(profile, target as View)) {
        addToast('That feature is not available in your current StudySnap mode.', 'warning');
        return;
      }
      setView(target as View);
      addToast(`Voice Command: Navigating to ${target}`, 'info');
    };
    window.addEventListener('voice_command', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voice_command', handleVoiceCommand as EventListener);
  }, [setView]);

  const goBack = React.useCallback(() => {
    const stack = navigationStackRef.current;
    if (stack.length > 1) {
      if (navigationReadyRef.current) {
        window.history.back();
      } else {
        stack.pop();
        setViewState(stack[stack.length - 1]);
      }
      return;
    }
    if (view !== 'home' && view !== 'login') {
      navigationStackRef.current = ['home'];
      setViewState('home');
    }
  }, [view]);

  // Child views use this navigator for semantic back links. If a feature asks
  // to go to the route that is already underneath it, we pop instead of
  // creating a duplicate history entry. This keeps browser/Android back
  // behaviour predictable and prevents the user from being dumped at Home.
  const navigateWithinView = React.useCallback((nextView: View) => {
    const stack = navigationStackRef.current;
    const previous = stack.length > 1 ? stack[stack.length - 2] : null;
    if (previous === nextView) {
      goBack();
      return;
    }
    if (nextView === 'home' && view !== 'home') {
      goBack();
      return;
    }
    setView(nextView);
  }, [goBack, setView, view]);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isOfflineHubOpen, setIsOfflineHubOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [previousView, setPreviousView] = useState<View>('home');
  const [textSize, setTextSize] = useState<'small' | 'normal' | 'large'>(() => {
    const saved = localStorage.getItem('studysnap-text-size');
    return saved === 'small' || saved === 'large' ? saved : 'normal';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('studysnap-notifications') !== 'false');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('studysnap-theme') as Theme;
    return (saved === 'black' || saved === 'midnight' || saved === 'white') ? saved : 'white';
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const searchRequestRef = React.useRef(0);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activityStats, setActivityStats] = useState<Record<string, number>>({});
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [liveRoomId, setLiveRoomId] = useState('');
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({ notes: 0, flashcards: 0, quizzes: 0 });
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<StudySnapContact[]>([]);
  const [groups, setGroups] = useState<{name: string, id: string}[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addingType, setAddingType] = useState<'contact' | 'group' | null>(null);
  const [newName, setNewName] = useState('');
  const [homeworkHelp, setHomeworkHelp] = useState<HomeworkHelp | null>(null);
  const [homeworkInput, setHomeworkInput] = useState('');

  // Study Room State
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [roomQuestions, setRoomQuestions] = useState<RoomQuestion[]>([]);
  const [roomResources, setRoomResources] = useState<RoomResource[]>([]);
  const [roomQuizScores, setRoomQuizScores] = useState<{user_name: string, score: number}[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState(() => localStorage.getItem('studysnap-username') || '');
  const [roomTab, setRoomTab] = useState<'chat' | 'questions' | 'resources' | 'quiz' | 'settings'>('chat');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');

  // Game Zone State
  const [isGameZoneOpen, setIsGameZoneOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  const [roomSettings, setRoomSettings] = useState<RoomSettings | null>(null);
  const [studyTimer, setStudyTimer] = useState(0);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [roomLeaderboard, setRoomLeaderboard] = useState<{user_name: string, score: number}[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [noteStartTime, setNoteStartTime] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  const [focusStats, setFocusStats] = useState<FocusStats>({
    user_name: userName,
    total_study_time: 0,
    quiz_accuracy: 0,
    game_speed: 0,
    streak_days: 0,
    focus_points: 0,
    notes: 0,
    flashcards: 0,
    quizzes: 0,
    last_activity_date: new Date().toISOString()
  });
  const [skillPassport, setSkillPassport] = useState<SkillPassport>({
    user_name: userName,
    logical_thinking: 0,
    memory_strength: 0,
    reaction_speed: 0,
    math_accuracy: 0,
    science_understanding: 0,
    problem_solving: 0
  });
  const [timeSpent, setTimeSpent] = useState(0); // in minutes
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  // Native Android/browser back: return to the previous StudySnap task instead of losing context.
  useEffect(() => {
    const onPopState = () => {
      if (navigationStackRef.current.length > 1) {
        navigationStackRef.current.pop();
        setViewState(navigationStackRef.current[navigationStackRef.current.length - 1]);
      }
    };
    window.history.replaceState({ studysnap: true }, '');
    navigationReadyRef.current = true;
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const quizAttempts = activityStats.quiz || 0;
    const totalActivities = Object.values(activityStats).reduce((sum, value) => sum + (Number(value) || 0), 0);
    setFocusStats({
      user_name: userName,
      total_study_time: Number(localStorage.getItem('studysnap-total-study-minutes') || 0),
      quiz_accuracy: quizAttempts ? Math.min(100, Math.round((stats.quizzes / quizAttempts) * 100)) : 0,
      game_speed: 0,
      streak_days: Number(activityStats.streak || 0),
      focus_points: totalActivities * 25,
      notes: stats.notes,
      flashcards: stats.flashcards,
      quizzes: stats.quizzes,
    });
  }, [activityStats, stats, userName]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('studysnap-theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-black', 'theme-white', 'theme-midnight', 'dark', 'light');
    root.classList.add(`theme-${theme}`);
    if (theme === 'black' || theme === 'midnight') {
      root.classList.add('dark');
      document.body.style.backgroundColor = theme === 'black' ? '#000000' : '#030712';
      document.body.style.color = '#ffffff';
    } else {
      root.classList.add('light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#09090b';
    }
  }, [theme]);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('studysnap-messages') || '[]');
    setMessages(storedMessages);

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        if (!userName) {
          setUserName(authUser.displayName || '');
          localStorage.setItem('studysnap-username', authUser.displayName || '');
        }
      } else {
        setView('login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile?.screen_time_limit && userProfile.screen_time_limit > 0) {
      const interval = setInterval(() => {
        setTimeSpent(prev => {
          const next = prev + 1;
          if (next >= userProfile.screen_time_limit!) {
            setIsTimeUp(true);
          }
          return next;
        });
      }, 60000); // every minute
      return () => clearInterval(interval);
    }
  }, [userProfile]);

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;
      if (!user) {
        setView('login');
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const profile = await DataService.getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          setUserName(profile.user_name);
          setView(profile.age_group === 'baby' ? 'early-learning' : 'home');
        } else if (profile === null) {
          // Only go to onboarding if we know for sure the profile doesn't exist
          setView('onboarding');
        } else {
          // profile is undefined (error occurred)
          addToast("Syncing neural profile from local cache...", "info");
          // We stay in current view or whatever was default
        }
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfile();
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubjects();
      fetchStats();
    }
  }, [user, authLoading]);

  const handleProfileSelect = async (profile: UserProfile) => {
    if (!profile.user_name.trim() || !profile.phone?.trim() || !user?.email) {
      addToast('A real name, verified sign-in email, and phone number are required.', 'error');
      return;
    }
    hapticClick();
    try {
      await DataService.createUserProfile(profile);
      hapticSuccess();
      setUserProfile(profile);
      setUserName(profile.user_name);
      if (profile.age_group === 'baby') {
        setView('early-learning');
      } else {
        setView('home');
      }
      addToast("Neural profile synchronized.", "success");
    } catch (e) {
      hapticError();
      addToast("Failed to sync profile", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserName('');
      setUserProfile(null);
      setView('login');
      addToast("Safe disconnect successful", "success");
    } catch (e) {
      addToast("Error during disconnect", "error");
    }
  };

  const logActivity = async (activity: {
    type: 'note_read' | 'quiz_taken' | 'game_played' | 'arena_match';
    subject_id?: string;
    duration?: number;
    score?: number;
    accuracy?: number;
    metadata?: any;
  }) => {
    try {
      await DataService.logActivity({
        user_name: userName,
        ...activity,
      });
      
      if (activity.type === 'quiz_taken') {
        setStats(prev => ({ ...prev, quizzes: prev.quizzes + 1 }));
      }
    } catch (e) {
      console.error("Activity log error:", e);
    }
  };

  const trackActivity = (activityType: string) => {
    const stats = JSON.parse(localStorage.getItem('studysnap-activity-stats') || '{}');
    const type = activityType === 'research-hub' ? 'research' : 
                 activityType === 'quiz' ? 'quiz' :
                 activityType === 'arena' ? 'arena' :
                 activityType === 'homework' ? 'homework' : activityType;
    stats[type] = (stats[type] || 0) + 1;
    localStorage.setItem('studysnap-activity-stats', JSON.stringify(stats));
    setActivityStats(stats);
  };

  useEffect(() => {
    if (['quiz', 'research-hub', 'arena', 'homework'].includes(view)) {
      trackActivity(view);
    }
    if (view === 'home') {
      const stats = JSON.parse(localStorage.getItem('studysnap-activity-stats') || '{}');
      setActivityStats(stats);
    }
  }, [view]);

  useEffect(() => {
    if (selectedNote && view === 'note') {
      setNoteStartTime(Date.now());
    } else if (noteStartTime) {
      const duration = Math.floor((Date.now() - noteStartTime) / 1000);
      if (duration > 5) { // Only log if spent more than 5 seconds
        const previousMinutes = Number(localStorage.getItem('studysnap-total-study-minutes') || 0);
        const nextMinutes = previousMinutes + Math.max(1, Math.round(duration / 60));
        localStorage.setItem('studysnap-total-study-minutes', String(nextMinutes));
        logActivity({
          type: 'note_read',
          subject_id: selectedNote?.subject_id,
          duration,
          metadata: { note_id: selectedNote?.id, title: selectedNote?.title }
        });
      }
      setNoteStartTime(null);
    }
  }, [selectedNote, view]);

  useEffect(() => {
    if (view === 'flashcards' && selectedNote?.id) fetchFlashcards(selectedNote.id);
  }, [view, selectedNote?.id]);

  // Voice Chat State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [activeVoiceUsers, setActiveVoiceUsers] = useState<string[]>([]);
  const voiceRecognitionRef = useRef<any>(null);

  const toggleVoice = async () => {
    if (isVoiceEnabled) {
      voiceRecognitionRef.current?.stop?.();
      voiceRecognitionRef.current = null;
      setIsVoiceEnabled(false);
      setActiveVoiceUsers(prev => prev.filter(name => name !== userName));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Voice input is not supported by this browser.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const last = event.results?.[event.results.length - 1]?.[0]?.transcript?.trim();
      if (last) sendRoomMessage(last);
    };
    recognition.onerror = () => {
      setIsVoiceEnabled(false);
      setActiveVoiceUsers(prev => prev.filter(name => name !== userName));
      addToast('Voice input stopped. Check microphone permissions.', 'warning');
    };
    recognition.onend = () => {
      if (voiceRecognitionRef.current === recognition) {
        voiceRecognitionRef.current = null;
        setIsVoiceEnabled(false);
        setActiveVoiceUsers(prev => prev.filter(name => name !== userName));
      }
    };
    try {
      recognition.start();
      voiceRecognitionRef.current = recognition;
      setIsVoiceEnabled(true);
      setActiveVoiceUsers(prev => prev.includes(userName) ? prev : [...prev, userName]);
    } catch {
      addToast('Could not start microphone input.', 'error');
    }
  };

  useEffect(() => () => { voiceRecognitionRef.current?.stop?.(); }, []);

  useEffect(() => {
    if (view !== 'studyroom' && isVoiceEnabled) {
      setIsVoiceEnabled(false);
    }
  }, [view, isVoiceEnabled]);


  useEffect(() => {
    if (userName) {
      localStorage.setItem('studysnap-username', userName);
    }
  }, [userName]);

  useEffect(() => {
    document.body.className = `theme-${theme} text-size-${textSize}`;
    localStorage.setItem('studysnap-theme', theme);
    localStorage.setItem('studysnap-text-size', textSize);
  }, [theme, textSize]);

  // This is a user preference, not proof that browser push permission was
  // granted. Persist it independently so a user can always opt out.
  useEffect(() => {
    localStorage.setItem('studysnap-notifications', String(notificationsEnabled));
  }, [notificationsEnabled]);


  const fetchStats = async () => {
    try {
      const subjects = await DataService.getSubjects();
      let totalNotes = 0;
      let totalFlashcards = 0;
      
      for (const sub of subjects) {
        const subjectNotes = await DataService.getNotes(sub.id);
        totalNotes += subjectNotes.length;
        for (const note of subjectNotes) {
          totalFlashcards += (await DataService.getFlashcards(note.id)).length;
        }
      }
      
      setStats(prev => ({ ...prev, notes: totalNotes, flashcards: totalFlashcards }));
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  };

  const fetchSubjects = async () => {
    try {
      const storedSubjects = await DataService.getSubjects();
      // Do not silently create content for a new account. An empty state is intentional
      // so the Home screen can guide the user through their own first subject.
      setSubjects(storedSubjects);
      fetchStats();
      fetchFavorites();
      fetchRecentNotes();
    } catch (e) {
      console.error("Subjects fetch error:", e);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favorites = await DataService.getFavoriteNotes();
      setFavoriteNotes(favorites);
    } catch (e) {
      console.error("Favorites fetch error:", e);
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const recent = await DataService.getRecentNotes(5);
      setRecentNotes(recent);
    } catch (e) {
      console.error("Recent notes fetch error:", e);
    }
  };

  const fetchNotes = async (subjectId: string) => {
    try {
      const filteredNotes = await DataService.getNotes(subjectId);
      setNotes(filteredNotes);
    } catch (e) {
      console.error("Notes fetch error:", e);
    }
  };

  const fetchFlashcards = async (noteId: string) => {
    try {
      const cards = await DataService.getFlashcards(noteId);
      setFlashcards(cards); setCurrentCardIndex(0); setIsFlipped(false);
    } catch (error) {
      console.error('Flashcard fetch error:', error);
      addToast('Could not load flashcards.', 'error'); setFlashcards([]);
    }
  };

  const fetchAllFlashcards = async () => {
    hapticClick();
    try {
      const cards = await DataService.getFlashcards();
      setFlashcards(cards); setCurrentCardIndex(0); setIsFlipped(false); setView('flashcards');
    } catch (error) {
      console.error('Flashcard fetch error:', error); addToast('Could not load flashcards.', 'error');
    }
  };

  const startGlobalQuiz = async () => {
    hapticClick();
    const source = recentNotes[0] || notes[0];
    if (!source) { addToast('Create a note first so the quiz engine has study material.', 'warning'); return; }
    await startQuiz(source);
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    hapticClick();
    try {
      const newSub = await DataService.createSubject(
        newSubjectName, 
        COLORS[Math.floor(Math.random() * COLORS.length)]
      );
      hapticSuccess();
      setNewSubjectName('');
      setIsAddingSubject(false);
      fetchSubjects();
      addToast(`Subject "${newSubjectName}" created in neural core`, "success");
    } catch (e) {
      hapticError();
      addToast("Failed to sync subject", "error");
    }
  };

  const toggleFavorite = async (note: Note) => {
    hapticClick();
    const newStatus = !note.is_favorite;
    try {
      await DataService.updateNote(note.id, { is_favorite: newStatus });
      hapticSuccess();
      setSelectedNote(prev => prev ? { ...prev, is_favorite: newStatus } : null);
      if (selectedSubject) fetchNotes(selectedSubject.id);
      addToast(newStatus ? "Neural tag: Favorite" : "Favorite tag removed", "success");
    } catch (e) {
      hapticError();
      addToast("Failed to sync favorite status", "error");
    }
  };

  const toggleLock = async (note: Note) => {
    hapticClick();
    const newStatus = !note.is_locked;
    try {
      await DataService.updateNote(note.id, { is_locked: newStatus });
      hapticSuccess();
      setSelectedNote(prev => prev ? { ...prev, is_locked: newStatus } : null);
      if (selectedSubject) fetchNotes(selectedSubject.id);
      addToast(newStatus ? "Biometric lock engaged" : "Biometric lock disengaged", "success");
    } catch (e) {
      hapticError();
      addToast("Failed to sync lock status", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject) return;

    setIsProcessing(true);
    setProcessingStep('Reading file...');

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          await handleCapture(base64);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        const text = await file.text();
        await processTextNote(text);
      } else {
        addToast("Unsupported file type. Please upload an image or a text file.", "error");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const processTextNote = async (text: string) => {
    if (!selectedSubject) return;
    
    try {
      setProcessingStep('Generating summary...');
      const summary = await generateSummary(text);
      
      const newNote = await DataService.createNote({
        subject_id: selectedSubject.id,
        title: text.split('\n')[0].substring(0, 50) || 'Uploaded Note',
        content: text,
        summary: summary,
      });

      setProcessingStep('Building flashcards...');
      const generatedCards = await generateFlashcards(text);
      if (generatedCards.length > 0) await DataService.saveFlashcards(newNote.id, generatedCards);
      setIsProcessing(false);
      fetchNotes(selectedSubject.id);
      setView('subject');
      addToast("Note synchronized with neural core", "success");
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      addToast("Failed to process neural link", "error");
    }
  };

  const handleCapture = async (base64: string, subjectId?: string) => {
    const targetSubjectId = subjectId || selectedSubject?.id;
    const targetSubject = subjects.find((subject) => subject.id === targetSubjectId) || selectedSubject;
    if (!targetSubject) {
      addToast('Create or select a subject before saving a scan.', 'warning');
      return;
    }
    hapticClick();
    setView('home'); // Temporary to show processing
    setIsProcessing(true);
    
    try {
      setProcessingStep('Extracting text from image...');
      const text = await performOCR(base64);
      
      setProcessingStep('Generating summary...');
      const summary = await generateSummary(text);
      
      const newNote = await DataService.createNote({
        subject_id: targetSubject.id,
        title: text.split('\n')[0].substring(0, 50) || 'New Note',
        content: text,
        summary: summary,
      });

      setProcessingStep('Building flashcards...');
      const generatedCards = await generateFlashcards(text);
      if (generatedCards.length > 0) await DataService.saveFlashcards(newNote.id, generatedCards);
      hapticSuccess();
      setProcessingStep('Knowledge integrated.');
      setTimeout(() => setIsProcessing(false), 1000);
      setSelectedSubject(targetSubject);
      fetchNotes(targetSubject.id);
      setView('subject');
      addToast("Neural scan complete. Knowledge integrated.", "success");
    } catch (err) {
      hapticError();
      console.error(err);
      setIsProcessing(false);
      addToast("Failed to process neural link", "error");
    }
  };

  const handleHomeworkHelp = async (input: string, isImage: boolean = false) => {
    setIsProcessing(true);
    setProcessingStep('Analyzing question...');
    try {
      const result = await generateHomeworkHelp(input, isImage);
      if (result) {
        setHomeworkHelp(result);
        setView('homework');
      } else {
        addToast("Failed to generate homework help.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("An error occurred while helping with homework.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveHomeworkSolution = async () => {
    if (!homeworkHelp || !selectedSubject) {
      if (!selectedSubject) addToast("Please select a subject first to save the solution.", "warning");
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Saving solution...');
    try {
      const content = `**Question:**\n${homeworkHelp.question}\n\n**Concept:** ${homeworkHelp.concept}\n\n**Explanation:**\n${homeworkHelp.explanation}\n\n**Steps:**\n${homeworkHelp.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      
      await DataService.createNote({
        subject_id: selectedSubject.id,
        title: `Solution: ${homeworkHelp.concept}`,
        content: content,
        summary: homeworkHelp.explanation,
      });

      fetchNotes(selectedSubject.id);
      addToast("Solution saved to your notes!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to save solution.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const requestId = ++searchRequestRef.current;
    const normalized = query.trim();

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (normalized.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce typing so mobile Safari, low-end Android and slow networks do not
    // start a Firestore/NeuralEngine search for every single keystroke.
    await new Promise<void>(resolve => {
      searchDebounceRef.current = setTimeout(resolve, 220);
    });
    if (requestId !== searchRequestRef.current) return;

    // Search the user's complete note library, not only the currently opened subject.
    // The current notes are used immediately, while the rest of the library is loaded
    // only when needed so normal Home/Subject rendering stays lightweight.
    let searchableNotes = notes;
    try {
      const allSubjects = subjects.length ? subjects : await DataService.getSubjects();
      const byId = new Map(searchableNotes.map(note => [note.id, note]));
      for (const subject of allSubjects) {
        const subjectNotes = await DataService.getNotes(subject.id);
        subjectNotes.forEach(note => byId.set(note.id, note));
      }
      searchableNotes = Array.from(byId.values());
    } catch (error) {
      console.warn('Full note search unavailable; using loaded notes.', error);
    }

    if (requestId !== searchRequestRef.current) return;

    try {
      const result = await NeuralEngine.search(searchableNotes, normalized, (n) => `${n.title ?? ''} ${n.content ?? ''}`);
      if (requestId !== searchRequestRef.current) return;
      if (result.status === 'Success' && result.data) {
        setSearchResults(result.data);
        return;
      }
    } catch (error) {
      console.warn('Neural search failed; using local search.', error);
    }

    // Reliable local fallback if the optimized indexer fails.
    const terms = normalized.toLowerCase().split(/\s+/).filter(Boolean);
    const fallback = searchableNotes.filter(note => {
      const haystack = `${note.title ?? ''} ${note.content ?? ''}`.toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
    if (requestId === searchRequestRef.current) setSearchResults(fallback);
  };

  const startQuiz = async (note: Note) => {
    setIsProcessing(true);
    setProcessingStep('Generating quiz...');
    const quiz = await generateQuiz(note.content);
    setQuizQuestions(quiz);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setIsProcessing(false);
    setView('quiz');
  };

  const handleQuizAnswer = (option: string) => {
    setSelectedOption(option);
    const isCorrect = option === quizQuestions[currentQuizIndex].correctAnswer;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuizIndex < quizQuestions.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
        const finalScore = quizScore + (isCorrect ? 1 : 0);
        logActivity({
          type: 'quiz_taken',
          subject_id: selectedNote?.subject_id,
          score: finalScore,
          accuracy: (finalScore / quizQuestions.length) * 100,
          metadata: { note_id: selectedNote?.id, title: selectedNote?.title }
        });
      }
    }, 1000);
  };

  const createRoom = async () => {
    if (!newRoomName || !newRoomSubject || !userName) {
      addToast("Please fill in all fields and set your username first.", "warning");
      return;
    }
    const id = crypto.randomUUID();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: StudyRoom = {
      id,
      name: newRoomName,
      code,
      subject: newRoomSubject,
      created_at: new Date().toISOString()
    };

    const existingRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    localStorage.setItem('rooms', JSON.stringify([...existingRooms, room]));
    
    setCurrentRoom(room);
    setRoomMessages([]);
    setRoomQuestions([]);
    setRoomResources([]);
    setRoomSettings({ room_id: id, games_enabled: true, study_duration: 30, break_duration: 5 });
    setRoomLeaderboard([]);
    setIsCreatingRoom(false);
    setView('studyroom');
  };

  useEffect(() => {
    if (!currentRoom || !roomSettings) return;

    const interval = setInterval(() => {
      setStudyTimer(prev => {
        const next = prev + 1;
        const studySecs = (roomSettings.study_duration || 30) * 60;
        const breakSecs = (roomSettings.break_duration || 5) * 60;

        if (!isBreakTime && next >= studySecs) {
          setIsBreakTime(true);
          setIsGameZoneOpen(true);
          return 0;
        } else if (isBreakTime && next >= breakSecs) {
          setIsBreakTime(false);
          setIsGameZoneOpen(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom, roomSettings, isBreakTime]);

  const updateRoomSettings = (settings: Partial<RoomSettings>) => {
    setRoomSettings(prev => prev ? { ...prev, ...settings } : null);
  };

  const joinRoom = async (code: string) => {
    if (!userName) {
      addToast("Please set your username first.", "warning");
      return;
    }
    const existingRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const room = existingRooms.find((r: any) => r.code === code.toUpperCase());
    
    if (room) {
      setCurrentRoom(room);
      setRoomMessages([]);
      setRoomQuestions([]);
      setRoomResources([]);
      setRoomSettings({ room_id: room.id, games_enabled: true, study_duration: 30, break_duration: 5 });
      setRoomLeaderboard([]);
      setIsJoiningRoom(false);
      setView('studyroom');
      addToast(`Joined room: ${room.name}`, "success");
    } else {
      addToast("Room not found.", "error");
    }
  };

  const sendRoomMessage = (text: string) => {
    if (!currentRoom || !userName || !text.trim()) return;
    const msg: RoomMessage = {
      id: crypto.randomUUID(),
      room_id: currentRoom.id,
      user_name: userName,
      text,
      created_at: new Date().toISOString()
    };
    setRoomMessages(prev => [...prev, msg]);
  };

  const postRoomQuestion = (question: string) => {
    if (!currentRoom || !userName || !question.trim()) return;
    const q: RoomQuestion = {
      id: crypto.randomUUID(),
      room_id: currentRoom.id,
      user_name: userName,
      question,
      created_at: new Date().toISOString()
    };
    setRoomQuestions(prev => [...prev, q]);
  };

  const answerRoomQuestion = (id: string, answer: string) => {
    if (!currentRoom || !userName || !answer.trim()) return;
    setRoomQuestions(prev => prev.map(q => q.id === id ? { ...q, answer, answered_by: userName } : q));
  };

  const shareRoomResource = (title: string, type: 'note' | 'image' | 'pdf', content: string) => {
    if (!currentRoom || !userName) return;
    const res: RoomResource = {
      id: crypto.randomUUID(),
      room_id: currentRoom.id,
      user_name: userName,
      title,
      type,
      content,
      created_at: new Date().toISOString()
    };
    setRoomResources(prev => [...prev, res]);
  };

  const startGroupQuiz = async () => {
    if (!currentRoom || roomResources.length === 0) {
      console.log("Share some notes first to generate a quiz!");
      return;
    }
    setIsProcessing(true);
    setProcessingStep('Generating group quiz...');
    const combinedNotes = roomResources.filter(r => r.type === 'note').map(r => r.content).join('\n\n');
    if (!combinedNotes) {
      console.log("No notes found in resources to generate a quiz.");
      setIsProcessing(false);
      return;
    }
    const quiz = await generateQuiz(combinedNotes);
    setQuizQuestions(quiz);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setIsProcessing(false);
    setView('quiz');
  };

  const handleResearch = async (query: string) => {
    setIsProcessing(true);
    setProcessingStep('Searching the web...');
    try {
      const result = await performWebSearch(query);
      setResearchResult(result);
      setPreviousView(view);
      setView('research');
    } catch (err) {
      console.error(err);
      console.log("Failed to perform web search.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getAnimationConfig = (): any => {
    const age = userProfile?.age_group || 'adult';
    switch (age) {
      case 'baby':
        return {
          transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
          initial: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
          animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)' }
        };
      case 'kid':
        return {
          transition: { type: "spring", stiffness: 400, damping: 30 },
          initial: { opacity: 0, y: 30, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -30, scale: 0.95 }
        };
      case 'teen':
        return {
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 }
        };
      default:
        return {
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: -10, filter: 'blur(4px)' }
        };
    }
  };


;

  const SideMenu = () => {
    const menuItems = [
      { id: 'dashboard', icon: <Brain size={20} />, label: 'AI Study Coach', minAge: 'teen', roles: ['student'] },
      { id: 'home', icon: <BookOpen size={20} />, label: 'Subjects' },
      { id: 'videos', icon: <Video size={20} />, label: 'Video Studio & Playlists' },
      { id: 'early-learning', icon: <Baby size={20} />, label: 'Early Learning', maxAge: 'baby' },
      { id: 'institution-portal', icon: <School size={20} />, label: 'Education Network', minAge: 'teen', roles: ['student', 'teacher', 'lecturer', 'admin', 'institution_owner'] },
      { id: 'campus', icon: <GraduationCap size={20} />, label: 'Institutions & Campuses', minAge: 'teen', roles: ['student', 'teacher', 'lecturer'] },
      { id: 'workspace-sync', icon: <Globe size={20} />, label: 'Study Workspace Sync', minAge: 'teen', roles: ['student', 'teacher', 'lecturer'] },
      { id: 'research-hub', icon: <Microscope size={20} />, label: 'Research Hub', minAge: 'teen', roles: ['researcher', 'lecturer', 'admin', 'student'] },
      { id: 'academic-profile', icon: <User size={20} />, label: 'Academic Profile', minAge: 'kid' },
      { id: 'learning-engine', icon: <Sparkles size={20} />, label: 'Smart Learning', minAge: 'kid', roles: ['student'] },
      { id: 'reputation', icon: <Star size={20} />, label: 'Reputation', minAge: 'teen' },
      { id: 'problem-solver', icon: <Zap size={20} />, label: 'Problem Solver', minAge: 'kid', roles: ['student'] },
      { id: 'teacher-insights', icon: <Presentation size={20} />, label: 'Teacher Insights', minAge: 'adult', roles: ['teacher', 'lecturer', 'admin'] },
      { id: 'institution-reports', icon: <Building2 size={20} />, label: 'Improvement Reports', minAge: 'adult', roles: ['admin', 'institution_owner'] },
      { id: 'events', icon: <Calendar size={20} />, label: 'Academic Events' },
      { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
      { id: 'studyroom', icon: <Users size={20} />, label: 'Group Study', minAge: 'teen', roles: ['student'] },
      { id: 'arena', icon: <Swords size={20} />, label: 'Live Arena', minAge: 'teen', roles: ['student'] },
      { id: 'league', icon: <Globe size={20} />, label: 'Brain League', minAge: 'teen', roles: ['student'] },
      { id: 'voice-tutor', icon: <Mic size={20} />, label: 'AI Voice Tutor', minAge: 'kid', roles: ['student'] },
      { id: 'revision-engine', icon: <Brain size={20} />, label: 'Revision Engine', minAge: 'kid', roles: ['student'] },
      { id: 'daily-challenges', icon: <Flame size={20} />, label: 'Daily Challenges', minAge: 'kid', roles: ['student'] },
      { id: 'exam-simulator', icon: <Timer size={20} />, label: 'Exam Simulator', minAge: 'teen', roles: ['student'] },
      { id: 'doubt-solver', icon: <MessageSquare size={20} />, label: 'Doubt Solver', minAge: 'kid', roles: ['student'] },
      { id: 'career-finder', icon: <Compass size={20} />, label: 'Career Finder', minAge: 'teen', roles: ['student'] },
      { id: 'marketplace', icon: <ShoppingBag size={20} />, label: 'Marketplace', minAge: 'teen' },
      { id: 'parent-mode', icon: <Shield size={20} />, label: 'Parent Mode', minAge: 'adult' },
      { id: 'handwriting-converter', icon: <Type size={20} />, label: 'Handwriting Converter', minAge: 'kid', roles: ['student'] },
      { id: 'homework', icon: <Sparkles size={20} />, label: 'Homework Helper', minAge: 'kid', roles: ['student'] },
      { id: 'recent', icon: <Clock size={20} />, label: 'Recent Notes', minAge: 'kid', roles: ['student'] },
      { id: 'flashcards', icon: <Layers size={20} />, label: 'Flashcards', action: fetchAllFlashcards, minAge: 'kid', roles: ['student'] },
      { id: 'quiz', icon: <Brain size={20} />, label: 'Quiz Center', action: startGlobalQuiz, minAge: 'kid', roles: ['student'] },
      { id: 'favorites', icon: <Star size={20} />, label: 'Favorites', minAge: 'kid' },
      { id: 'statistics', icon: <BarChart3 size={20} />, label: 'Statistics', minAge: 'teen', roles: ['student', 'teacher', 'lecturer'] },
      { id: 'export', icon: <Share2 size={20} />, label: 'Export Notes', minAge: 'adult' },
      { id: 'file-studio', icon: <Presentation size={20} />, label: 'PDF & PowerPoint Studio', minAge: 'teen', roles: ['student', 'teacher', 'lecturer', 'researcher', 'admin'] },
      { id: 'mobile-qr', icon: <QrCode size={20} />, label: 'Scan Mobile QR', action: () => setIsQRCodeModalOpen(true) },
      { type: 'divider' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
      { id: 'help', icon: <QuestionIcon size={20} />, label: 'Help' },
      { id: 'policies', icon: <Shield size={20} />, label: 'Policies' },
    ].filter(item => {
      if (item.type === 'divider') return true;
      if (!item.id) return false;
      return canUseView(userProfile, item.id as View);
    });

    return (
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              style={{ touchAction: 'none' }}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-app-card z-[70] shadow-2xl flex flex-col pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[var(--safe-left)]"
              style={{ touchAction: 'pan-y' }}
            >
              <div className="p-6 sm:p-8 border-b border-app-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-app-text">StudySnap</h2>
                    <p className="text-xs text-app-text-muted">
                      {userProfile?.age_group === 'baby' ? 'Fun Learning!' : 
                       userProfile?.age_group === 'kid' ? 'Your Study Buddy' : 
                       'AI Learning Platform'}
                    </p>
                  </div>
                </div>
                {userProfile && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-app-bg border border-app-border">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-app-text">{userProfile.user_name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{userProfile.age_group} mode</p>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            setView('settings');
                          }}
                          className="text-[10px] font-bold text-app-text-muted hover:text-indigo-600 underline"
                        >
                          Shift
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item, idx) => {
                  if (item.type === 'divider') return <div key={idx} className="h-px bg-app-border my-4 mx-4" />;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          setView(item.id as View);
                        }
                        setIsMenuOpen(false);
                      }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-colors ${
                        view === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-app-text-muted hover:bg-app-bg'
                      }`}
                    >
                      {item.icon}
                      <span className="font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6 border-t border-app-border">
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">StudySnap</p>
                  <button onClick={() => { setIsMenuOpen(false); setView('policies'); }} className="text-[10px] font-bold text-app-text-muted hover:text-app-accent underline underline-offset-2">Privacy & Policies</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  const getCABConfig = () => {
    switch(view) {
      // Search already has a dedicated bottom-navigation entry and the Home
      // screen has its own Find something card. Avoid a second floating
      // search control competing with the Live/AI action on small screens.
      case 'home':
        return null;
      case 'subject':
        return { icon: <Plus size={24} />, label: 'Add Note', action: () => fileInputRef.current?.click() };
      case 'note':
        return { icon: <Brain size={24} />, label: 'Quiz', action: () => selectedNote && startQuiz(selectedNote) };
      case 'quiz':
        return { icon: <X size={24} />, label: 'Exit', action: () => setView('note') };
      default:
        return null;
    }
  };
  const cabConfig = getCABConfig();

  const onSendMessage = (msg: any) => {
    setMessages(prev => {
      const next = [...prev, msg];
      localStorage.setItem('studysnap-messages', JSON.stringify(next));
      return next;
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).__studysnapDeferredInstallPrompt ?? null;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    if (standalone) {
      setIsStandalone(true);
      setShowInstallPopup(false);
      return;
    }

    const dismissed = sessionStorage.getItem('studysnap-install-dismissed') === 'true';
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const syncInstallPrompt = () => {
      const promptEvent = (window as any).__studysnapDeferredInstallPrompt ?? null;
      if (!promptEvent) return;
      setDeferredPrompt(promptEvent);
      if (!dismissed) setShowInstallPopup(true);
    };

    const handleBeforeInstallPrompt = () => syncInstallPrompt();

    const handleAppInstalled = () => {
      setShowInstallPopup(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      (window as any).__studysnapDeferredInstallPrompt = null;
      localStorage.setItem('studysnap-installed', 'true');
      sessionStorage.setItem('studysnap-install-dismissed', 'true');
      addToast('StudySnap Pro installed successfully! Launch directly from your home screen.', 'success');
    };

    // The listener in main.tsx captures the event early. This second listener
    // lets the mounted React app consume it if the event arrives later.
    window.addEventListener('studysnap-install-available', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Consume an event that was captured before this component mounted.
    syncInstallPrompt();

    // iOS Safari does not expose beforeinstallprompt, so provide manual
    // Add to Home Screen instructions when the browser is not standalone.
    const iosTimer = isIosDevice && !dismissed
      ? window.setTimeout(() => setShowInstallPopup(true), 1200)
      : undefined;

    return () => {
      window.removeEventListener('studysnap-install-available', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt ?? (window as any).__studysnapDeferredInstallPrompt;

    if (!promptEvent) {
      if (isIOS) {
        addToast('On iPhone/iPad: tap Share → Add to Home Screen.', 'info');
      } else {
        addToast('StudySnap is not installable yet. Make sure you are using HTTPS and a supported browser, then try the browser menu → Install app.', 'info');
      }
      return;
    }

    try {
      // prompt() must be called from the user's click/tap gesture.
      setShowInstallPopup(false);
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).__studysnapDeferredInstallPrompt = null;
        sessionStorage.setItem('studysnap-install-dismissed', 'true');
      } else {
        // Keep the prompt available only if the browser allows another prompt;
        // otherwise wait for a future beforeinstallprompt event.
        setDeferredPrompt(null);
        (window as any).__studysnapDeferredInstallPrompt = null;
      }
    } catch (err) {
      console.warn('Install prompt execution warning:', err);
    }
  };

  const dismissInstallPopup = () => {
    hapticClick();
    setShowInstallPopup(false);
    sessionStorage.setItem('studysnap-install-dismissed', 'true');
  };

  if (authLoading || profileLoading) {
    return <NativeBoot />;
  }

  const viewLabels: Partial<Record<View, string>> = {
    home: 'Home', search: 'Search', chats: 'Chats', communities: 'Community', settings: 'Settings',
    dashboard: 'AI Study Coach', 'studysnap-ai': 'StudySnap AI', scanner: 'Scanner', subject: 'Subject', note: 'Note',
    flashcards: 'Flashcards', quiz: 'Quiz Center', research: 'Research', 'research-hub': 'Research Hub',
    'voice-tutor': 'AI Voice Tutor', 'studyroom': 'Group Study', 'file-studio': 'File Studio', notifications: 'Notifications',
    statistics: 'Statistics', events: 'Academic Events', videos: 'Video Studio'
  };

    const AppTopBar = () => {
      if (view === 'login') return null;
      const label = viewLabels[view] || 'StudySnap';
    
      return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border backdrop-blur-md bg-opacity-90">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif italic tracking-tight text-app-text">StudySnap</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('scanner')} className="text-app-text">
              <Plus size={24} strokeWidth={2} />
            </button>
            <button onClick={() => setView('notifications')} className="text-app-text relative">
              <Star size={24} strokeWidth={2} />
            </button>
            <button onClick={() => setView('chats')} className="text-app-text">
              <MessageSquare size={24} strokeWidth={2} />
            </button>
          </div>
        </header>
      );
    };

  return (
    <div className={`studysnap-app-shell h-[100dvh] min-h-[100dvh] flex flex-col theme-${theme} neural-bg relative overflow-hidden`}>
      <AnimatePresence>
        {isTimeUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center p-8 text-center pt-[calc(2rem+var(--safe-top))] pb-[calc(2rem+var(--safe-bottom))]"
          >
            <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-8">
              <Clock size={64} />
            </div>
            <h1 className="text-3xl font-black text-app-text mb-4">Time's Up!</h1>
            <p className="text-app-text-muted mb-12 text-lg">
              You've reached your screen time limit for today. Time to take a break and play outside!
            </p>
            <button 
              onClick={() => setIsTimeUp(false)}
              className="px-8 py-4 rounded-3xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-200"
            >
              Parent Unlock
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NativeBridge />
      <main
        className="studysnap-main flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain"
        style={{
          overflowY: isMenuOpen ? 'hidden' : 'auto',
          touchAction: isMenuOpen ? 'none' : 'pan-y'
        }}
      >
      <AppTopBar />
      <ViewRenderer
        view={view}
        setView={navigateWithinView}
        goBack={goBack}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        subjects={subjects}
        setSubjects={setSubjects}
        notes={notes}
        setNotes={setNotes}
        flashcards={flashcards}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
        fetchNotes={fetchNotes}
        fetchFlashcards={fetchFlashcards}
        setIsMenuOpen={setIsMenuOpen}
        setIsThemePickerOpen={setIsThemePickerOpen}
        setIsAddingSubject={setIsAddingSubject}
        setIsFocusMode={setIsFocusMode}
        toggleFavorite={toggleFavorite}
        toggleLock={toggleLock}
        setCurrentCardIndex={setCurrentCardIndex}
        setIsFlipped={setIsFlipped}
        isFlipped={isFlipped}
        currentCardIndex={currentCardIndex}
        startQuiz={startQuiz}
        quizFinished={quizFinished}
        currentQuizIndex={currentQuizIndex}
        quizQuestions={quizQuestions}
        quizScore={quizScore}
        selectedOption={selectedOption}
        handleQuizAnswer={handleQuizAnswer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        handleSearch={handleSearch}
        handleResearch={handleResearch}
        userName={userName}
        setUserName={setUserName}
        userEmail={user?.email || ''}
        authIsAnonymous={!!user?.isAnonymous}
        messages={messages}
        onSendMessage={onSendMessage}
        setIsLive={setIsLive}
        setIsBroadcaster={setIsBroadcaster}
        setLiveRoomId={setLiveRoomId}
        isLive={isLive}
        isBroadcaster={isBroadcaster}
        liveRoomId={liveRoomId}
        focusStats={focusStats}
        skillPassport={skillPassport}
        getAnimationConfig={getAnimationConfig}
        handleProfileSelect={handleProfileSelect}
        handleCapture={handleCapture}
        researchResult={researchResult}
        previousView={previousView}
        currentRoom={currentRoom}
        setIsGameZoneOpen={setIsGameZoneOpen}
        toggleVoice={toggleVoice}
        isVoiceEnabled={isVoiceEnabled}
        activeVoiceUsers={activeVoiceUsers}
        roomTab={roomTab}
        setRoomTab={setRoomTab}
        roomMessages={roomMessages}
        postRoomQuestion={postRoomQuestion}
        roomQuestions={roomQuestions}
        answerRoomQuestion={answerRoomQuestion}
        shareRoomResource={shareRoomResource}
        roomResources={roomResources}
        startGroupQuiz={startGroupQuiz}
        roomQuizScores={roomQuizScores}
        roomSettings={roomSettings}
        achievements={achievements}
        sendRoomMessage={sendRoomMessage}
        updateRoomSettings={updateRoomSettings}
        theme={theme}
        handleLogout={handleLogout}
        favoriteNotes={favoriteNotes}
        recentNotes={recentNotes}
        homeworkHelp={homeworkHelp}
        homeworkInput={homeworkInput}
        setHomeworkInput={setHomeworkInput}
        handleHomeworkHelp={handleHomeworkHelp}
        addToast={addToast}
        onInstallApp={handleInstallClick}
        onOpenQR={() => setIsQRCodeModalOpen(true)}
        canInstall={!!deferredPrompt || (isIOS && !isStandalone)}
        isStandalone={isStandalone}
        isIOS={isIOS}
        textSize={textSize}
        setTextSize={setTextSize}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
      />
      </main>

      <AnimatePresence>
        {showInstallPopup && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(6.5rem+var(--safe-bottom))] left-3 right-3 sm:left-auto sm:right-8 sm:bottom-8 sm:w-96 z-[900]"
          >
            <div className="p-5 rounded-[2rem] shadow-2xl border flex flex-col gap-4 overflow-hidden relative bg-app-card border-app-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-app-accent/10 text-app-accent rounded-2xl">
                    <Download className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-app-text text-base">
                      Install StudySnap
                    </h3>
                    <p className="text-xs opacity-70 text-app-text-muted">
                      Add to home screen for faster access
                    </p>
                  </div>
                </div>
                <button 
                  onClick={dismissInstallPopup}
                  className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={20} className="text-app-text" />
                </button>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] bg-app-accent text-white rounded-2xl shadow-lg shadow-app-accent/20 hover:opacity-90"
                >
                  Install Now
                </button>
                <button
                  onClick={dismissInstallPopup}
                  className="px-4 py-3 font-black uppercase tracking-[0.2em] text-[10px] border border-app-border text-app-text-muted hover:text-app-text rounded-2xl"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SideMenu />

      {/* Offline Status Banner */}
      <OfflineStatusBanner onOpenOfflineHub={() => setIsOfflineHubOpen(true)} />

      {/* Offline Activities Hub Modal */}
      <OfflineActivitiesHub
        isOpen={isOfflineHubOpen}
        onClose={() => setIsOfflineHubOpen(false)}
        onSelectView={(v) => {
          setView(v);
          setIsOfflineHubOpen(false);
        }}
      />

      {/* Mobile QR Code Modal */}
      <MobileQRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
      />

        {isAdding && addingType === 'contact' && (
        <CountryContactModal
          onClose={() => { setIsAdding(false); setAddingType(null); }}
          onSave={(contact) => {
            setContacts(prev => { const next = [...prev, contact]; localStorage.setItem('studysnap-contacts', JSON.stringify(next)); return next; });
            setIsAdding(false);
            setAddingType(null);
            setNewName('');
            addToast(`Contact ${contact.name} added`, 'success');
          }}
        />
      )}
      {isAdding && addingType === 'group' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[120] flex items-end sm:items-center justify-center p-4" onClick={() => setIsAdding(false)}>
          <div className="bg-app-card border border-app-border rounded-[2rem] p-5 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black mb-2 text-app-text">Add study group</h2>
            <p className="text-xs text-app-text-muted mb-4">Create a focused space without filling the main screen.</p>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (() => { const cleanName = newName.trim(); if (!cleanName) return; const item = {name: cleanName, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)}; setGroups(prev => { const next = [...prev, item]; localStorage.setItem('studysnap-communities', JSON.stringify(next.map(g => ({ id: `community-${g.id}`, name: g.name, members: 1, online: 1 })))); return next; }); setIsAdding(false); setAddingType(null); setNewName(''); })()} className="w-full min-h-12 p-3 bg-app-bg border border-app-border rounded-2xl text-app-text outline-none focus:border-app-accent" placeholder="Group name" maxLength={80}/>
            <div className="flex gap-2 mt-4"><button onClick={() => { const cleanName = newName.trim(); if (!cleanName) return; const item = {name: cleanName, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2)}; setGroups(prev => { const next = [...prev, item]; localStorage.setItem('studysnap-communities', JSON.stringify(next.map(g => ({ id: `community-${g.id}`, name: g.name, members: 1, online: 1 })))); return next; }); setIsAdding(false); setAddingType(null); setNewName(''); addToast('Study group added', 'success'); }} className="flex-1 min-h-12 bg-app-accent text-white rounded-2xl font-black">Add group</button><button onClick={() => setIsAdding(false)} className="min-h-12 px-4 border border-app-border text-app-text-muted rounded-2xl font-bold">Cancel</button></div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isFocusMode && (
          <FocusMode onExit={() => setIsFocusMode(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingSubject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-3xl p-6 w-full max-w-sm shadow-2xl pt-[calc(1.5rem+var(--safe-top))] pb-[calc(1.5rem+var(--safe-bottom))]"
            >
              <h2 className="text-xl font-bold mb-4 text-app-text">New Subject</h2>
              <input 
                autoFocus
                type="text"
                placeholder="Subject name (e.g. Biology)"
                className="w-full p-4 bg-app-bg rounded-2xl mb-6 outline-none focus:ring-2 ring-indigo-500 text-app-text"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddingSubject(false)}
                  className="flex-1 p-4 rounded-2xl bg-app-bg font-bold text-app-text"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddSubject}
                  className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-bold"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreatingRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-3xl p-6 w-full max-w-sm shadow-2xl pt-[calc(1.5rem+var(--safe-top))] pb-[calc(1.5rem+var(--safe-bottom))]"
            >
              <h2 className="text-xl font-bold mb-4 text-app-text">Create Study Room</h2>
              {!userName && (
                <input 
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-4 bg-app-bg rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 text-app-text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              )}
              <input 
                type="text"
                placeholder="Room Name (e.g. Bio Revision)"
                className="w-full p-4 bg-app-bg rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 text-app-text"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
              />
              <input 
                type="text"
                placeholder="Subject"
                className="w-full p-4 bg-app-bg rounded-2xl mb-6 outline-none focus:ring-2 ring-indigo-500 text-app-text"
                value={newRoomSubject}
                onChange={e => setNewRoomSubject(e.target.value)}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreatingRoom(false)}
                  className="flex-1 p-4 rounded-2xl bg-app-bg text-app-text font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={createRoom}
                  className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-bold"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJoiningRoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-app-card rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-app-text">Join Study Room</h2>
              {!userName && (
                <input 
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-4 bg-app-bg rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 text-app-text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              )}
              <input 
                autoFocus
                type="text"
                placeholder="Room Code (e.g. XJ4K2L)"
                className="w-full p-4 bg-app-bg rounded-2xl mb-6 outline-none focus:ring-2 ring-indigo-500 text-app-text uppercase"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && joinRoom(roomCode)}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsJoiningRoom(false)}
                  className="flex-1 p-4 rounded-2xl bg-app-bg text-app-text font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => joinRoom(roomCode)}
                  className="flex-1 p-4 rounded-2xl bg-indigo-600 text-white font-bold"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThemePickerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setIsThemePickerOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-app-card rounded-t-[40px] p-6 sm:p-8 w-full max-w-lg shadow-2xl pb-[calc(2rem+var(--safe-bottom))] border-t border-app-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-app-text">Choose Theme</h2>
                  <p className="text-xs text-app-text-muted mt-0.5">Customize your interface appearance and contrast</p>
                </div>
                <button onClick={() => setIsThemePickerOpen(false)} className="p-2.5 rounded-full bg-app-bg text-app-text-muted hover:text-app-text border border-app-border">
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'black', name: 'Pure OLED Dark', icon: <Moon size={22} />, color: 'bg-black border-zinc-800 text-indigo-400', desc: 'True Pitch Black #000000' },
                  { id: 'midnight', name: 'Midnight Slate', icon: <Sparkles size={22} />, color: 'bg-[#0b1120] border-slate-700 text-sky-400', desc: 'Deep Space Navy' },
                  { id: 'white', name: 'Minimalist Light', icon: <Sun size={22} />, color: 'bg-white border-zinc-200 text-indigo-600', desc: 'Clean White Canvas' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id as Theme);
                      setIsThemePickerOpen(false);
                    }}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all text-center ${
                      theme === t.id ? 'border-app-accent ring-4 ring-app-accent/20 bg-app-card scale-[1.02]' : 'border-app-border bg-app-bg/50 hover:border-app-text-muted/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${t.color} border flex items-center justify-center shadow-lg`}>
                      {t.icon}
                    </div>
                    <div>
                      <div className="font-black text-app-text text-sm">{t.name}</div>
                      <div className="text-[10px] font-bold text-app-text-muted mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {view !== 'login' && !isTimeUp && !isProcessing && (
          <BottomNavigation 
            currentView={view}
            onNavigate={(v) => setView(v as View)}
            onOpenMenu={() => setIsMenuOpen(true)}
            onAdd={() => {
              switch(view) {
                case 'chats':
                  setAddingType('contact');
                  setIsAdding(true);
                  break;
                case 'communities':
                  setAddingType('group');
                  setIsAdding(true);
                  break;
                case 'updates':
                  setView('updates');
                  break;
                case 'calls':
                  setView('calls');
                  break;
                default:
                  if (!selectedSubject) {
                    addToast("Please select a subject first to upload notes.", "warning");
                    return;
                  }
                  fileInputRef.current?.click();
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Scanner Overlay */}
      <AnimatePresence>
        {view === 'scanner' && (
          <Scanner 
            onCapture={handleCapture}
            subjects={subjects.map(subject => ({ id: subject.id, name: subject.name }))}
            initialSubjectId={selectedSubject?.id}
            onClose={() => setView(selectedSubject ? 'subject' : 'home')}
          />
        )}
      </AnimatePresence>

      {/* Contextual Action Button (CAB) */}
      <AnimatePresence>
        {cabConfig && !showInstallPopup && !isTimeUp && !isProcessing && view !== 'alchemy' && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={cabConfig.action}
            className="fixed bottom-[calc(6.75rem+var(--safe-bottom))] sm:bottom-28 right-4 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-app-accent text-white shadow-2xl shadow-app-accent/30 flex items-center justify-center group"
          >
            <div className="absolute -top-12 right-0 bg-app-card border border-app-border px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm">
              {cabConfig.label}
            </div>
            {React.isValidElement(cabConfig.icon) ? React.cloneElement(cabConfig.icon as React.ReactElement<any>, { size: 24, className: 'sm:size-7' }) : cabConfig.icon}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global Processing Loader */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-app-bg/80 backdrop-blur-xl z-[900] flex flex-col items-center justify-center p-10 text-center pt-[calc(2.5rem+var(--safe-top))] pb-[calc(2.5rem+var(--safe-bottom))]"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-app-accent/10" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-24 h-24 rounded-full border-4 border-app-accent border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-app-accent animate-pulse" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-black mb-2 text-app-text tracking-tight font-sans">AI is crafting...</h2>
            <p className="text-app-text-muted font-bold uppercase tracking-widest text-xs">{processingStep}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette 
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onNavigate={(v) => setView(v)}
            onOpenQR={() => setIsQRCodeModalOpen(true)}
            userName={userName}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
