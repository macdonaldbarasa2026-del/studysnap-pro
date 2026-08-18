export interface Subject {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: string;
  summary: string | null;
  is_favorite?: boolean;
  is_locked?: boolean;
  created_at: string;
}

export interface Flashcard {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export type View = 'home' | 'subject' | 'note' | 'scanner' | 'flashcards' | 'quiz' | 'search' | 'research' | 'dashboard' | 'favorites' | 'offline' | 'statistics' | 'settings' | 'help' | 'about' | 'policies' | 'recent' | 'export' | 'homework' | 'studyroom' | 'arena' | 'league' | 'handwriting-converter' | 'voice-tutor' | 'revision-engine' | 'daily-challenges' | 'exam-simulator' | 'doubt-solver' | 'career-finder' | 'parent-mode' | 'marketplace' | 'ai-study-twin' | 'live-classroom' | 'auto-note-builder' | 'error-tracker' | 'academic-timeline' | 'knowledge-battles' | 'early-learning' | 'kids-learning' | 'videos' | 'onboarding' | 'age-selection' | 'role-selection' | 'institution-portal' | 'campus' | 'research-hub' | 'events' | 'notifications' | 'academic-profile' | 'learning-engine' | 'reputation' | 'problem-solver' | 'teacher-insights' | 'institution-reports' | 'chats' | 'updates' | 'communities' | 'calls' | 'bites' | 'alchemy' | 'knowledge-map' | 'login' | 'admin-inspection' | 'studysnap-ai' | 'workspace-sync' | 'file-studio';

export type Dimension = 'normal' | 'zen' | 'cyber' | 'void' | 'nebula';

export interface StudyBite {
  id: string;
  topic: string;
  content: string;
  author: string;
  author_avatar?: string;
  likes: number;
  shares: number;
  comments: number;
  tags: string[];
  created_at: string;
}

export type AgeGroup = 'baby' | 'kid' | 'teen' | 'adult';

export interface StudyMistake {
  id: string;
  user_name: string;
  topic: string;
  question: string;
  wrong_answer: string;
  correct_answer: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  user_name: string;
  title: string;
  description: string;
  type: 'milestone' | 'achievement' | 'study_session' | 'improvement';
  date: string;
  metadata?: any;
}

export interface LiveSession {
  id: string;
  host_id: string;
  host_name: string;
  title: string;
  subject: string;
  status: 'active' | 'finished';
  participants_count: number;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  type: 'quiz' | 'game' | 'note' | 'flashcard';
  completed: boolean;
}

export interface RevisionSchedule {
  id: string;
  user_name: string;
  item_id: string; // note_id or flashcard_id
  item_type: 'note' | 'flashcard';
  next_review: string;
  interval: number; // days
  ease_factor: number;
}

export interface UserProfile {
  user_name: string;
  email?: string;
  age_group: AgeGroup;
  screen_time_limit?: number; // minutes
  sound_enabled: boolean;
  parental_lock: boolean;
  institution_id?: string;
  department_id?: string;
  role: 'student' | 'teacher' | 'lecturer' | 'researcher' | 'admin' | 'institution_owner';
  requested_role?: 'teacher' | 'lecturer' | 'researcher' | 'institution_owner' | 'admin';
  learning_mode?: 'baby' | 'kids' | 'teen' | 'adult' | 'teacher' | 'researcher' | 'admin';
  reputation_score: number;
  reputation_level: 'learner' | 'scholar' | 'expert' | 'academic_master';
  bio?: string;
  phone?: string;
  description?: string;
  followers_count: number;
  following_count: number;
  subscribers_count: number;
  personal_venues?: string[];
  parental_pin?: string;
  parental_pin_updated_at?: string;
  can_go_live: boolean;
  avatar_filter_enabled: boolean;
}

export interface SkillPassport {
  user_name: string;
  logical_thinking: number;
  memory_strength: number;
  reaction_speed: number;
  math_accuracy: number;
  science_understanding: number;
  problem_solving: number;
}

export type InstitutionType = 'primary' | 'secondary' | 'college' | 'technical_college' | 'university' | 'research_center';

export type InstitutionVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  verified: boolean;
  verification_status?: InstitutionVerificationStatus;
  official_website?: string;
  official_portal_url?: string;
  official_email?: string;
  registration_number?: string;
  phone?: string;
  address?: string;
  logo?: string;
  departments: Department[];
  admin_id: string;
  created_at: string;
}

export interface InstitutionVerificationDocument {
  id: string;
  institution_id: string;
  name: string;
  storage_path: string;
  type: string;
  uploaded_at: string;
}

export interface InstitutionPaymentConfig {
  institution_id: string;
  provider: 'external_portal' | 'mpesa' | 'stripe' | 'bank';
  payment_url?: string;
  account_reference?: string;
  enabled: boolean;
}


export interface Department {
  id: string;
  name: string;
  head_id?: string;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturer_id: string;
  description: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'institution_join' | 'exam' | 'research' | 'assignment' | 'result' | 'study_room' | 'event';
  read: boolean;
  created_at: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  author_id: string;
  institution_id: string;
  dataset_url?: string;
  collaborators: string[];
  tags: string[];
  created_at: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  type: 'presentation' | 'debate' | 'seminar' | 'competition';
  institution_id: string;
  start_time: string;
  description: string;
  is_global: boolean;
  created_at: string;
}

export type Theme = 'black' | 'midnight' | 'white';

export interface StudyRoom {
  id: string;
  name: string;
  code: string;
  subject: string;
  created_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

export interface RoomQuestion {
  id: string;
  room_id: string;
  user_name: string;
  question: string;
  answer?: string;
  answered_by?: string;
  created_at: string;
}

export interface RoomResource {
  id: string;
  room_id: string;
  user_name: string;
  title: string;
  type: 'note' | 'image' | 'pdf';
  content: string;
  created_at: string;
}

export type GameType = 'puzzle' | 'memory' | 'logic' | 'math' | 'word' | 'pattern';

export interface GameSession {
  id: string;
  room_id: string;
  game_type: GameType;
  config: any;
  duration: number;
  status: 'active' | 'finished';
  created_at: string;
}

export interface GameScore {
  id: string;
  session_id: string;
  user_name: string;
  score: number;
  accuracy: number;
  time_taken: number;
  created_at: string;
}

export interface RoomSettings {
  room_id: string;
  games_enabled: boolean;
  study_duration: number; // minutes
  break_duration: number; // minutes
}

export interface Achievement {
  id: string;
  user_name: string;
  title: string;
  badge: string;
  description: string;
  type: 'badge' | 'certificate';
  is_verified: boolean;
  verified_by?: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  user_name: string;
  title: string;
  type: 'research' | 'project' | 'assignment' | 'presentation';
  content_url?: string;
  description: string;
  is_verified: boolean;
  verified_by?: string;
  created_at: string;
}

export interface ResearchResult {
  text: string;
  sources: { title: string; url: string }[];
}

export interface HomeworkHelp {
  question: string;
  concept: string;
  explanation: string;
  steps: string[];
  practiceQuestions: {
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}

export type ArenaRank = 'beginner' | 'skilled' | 'advanced' | 'master';

export interface ArenaProfile {
  user_name: string;
  rank: ArenaRank;
  points: number;
  matches_played: number;
  matches_won: number;
  avg_accuracy: number;
  avg_reaction_time: number;
}

export interface ArenaMatch {
  id: string;
  players: string[];
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  rounds: ArenaRound[];
  current_round_idx: number;
  scores: Record<string, number>;
  created_at: string;
}

export interface ArenaRound {
  type: GameType;
  config: any;
  duration: number;
  results: Record<string, RoundResult>;
}

export interface RoundResult {
  score: number;
  accuracy: number;
  time_taken: number;
}

export interface MatchState {
  matchId: string;
  opponent: string;
  opponentProgress: number; // 0-100
  opponentScore: number;
  timeLeft: number;
  status: 'countdown' | 'playing' | 'round_end' | 'match_end';
  isLeague?: boolean;
}

export interface LeagueSeason {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'finished';
}

export interface LeagueRanking {
  season_id: string;
  user_name: string;
  points: number;
  matches_played: number;
  matches_won: number;
  tier: 'bronze' | 'silver' | 'gold' | 'elite' | 'champion';
  institution_id?: string;
}

export interface InstitutionLeagueStats {
  season_id: string;
  institution_id: string;
  name: string;
  type: string;
  points: number;
  student_count: number;
}

export interface StudyPlanItem {
  id: string;
  type: 'revision' | 'flashcards' | 'quiz' | 'game';
  title: string;
  description: string;
  duration: number; // minutes
  completed: boolean;
  subject_id?: string;
}

export interface StudyPlan {
  id: string;
  date: string;
  items: StudyPlanItem[];
  focus_goal: number; // minutes
}

export interface StudyRecommendation {
  id: string;
  user_name: string;
  type: 'review' | 'practice' | 'quiz' | 'game';
  title: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DailyStudyPlan {
  id: string;
  user_name: string;
  date: string;
  tasks: {
    id: string;
    title: string;
    duration: number;
    type: string;
    completed: boolean;
  }[];
}

export interface ActivityLog {
  id: string;
  user_name: string;
  type: 'note_read' | 'quiz_taken' | 'game_played' | 'arena_match';
  subject_id?: string;
  duration: number; // seconds
  score?: number;
  accuracy?: number;
  metadata?: any;
  created_at: string;
}

export interface CoachInsight {
  id: string;
  user_name: string;
  type: 'weak_area' | 'strength' | 'recommendation';
  title: string;
  content: string;
  subject_id?: string;
  created_at: string;
}

export interface FocusStats {
  user_name: string;
  total_study_time: number; // minutes
  quiz_accuracy: number;
  game_speed: number;
  streak_days: number;
  focus_points: number;
  notes: number;
  flashcards: number;
  quizzes: number;
  last_activity_date?: string;
}

export interface LearningProblem {
  id: string;
  user_name: string;
  topic: string;
  problem_type: 'weak_understanding' | 'slow_reaction' | 'poor_performance';
  severity: 'low' | 'medium' | 'high';
  status: 'detected' | 'resolved';
  metadata?: any;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_name: string;
  subject_id: string;
  score: number;
  total_questions: number;
  mistakes: string[]; // topics or question IDs
  topic?: string;
  created_at: string;
}

export interface TeacherInsights {
  topic_failure_rates: { topic: string; failure_rate: number }[];
  average_performance: number;
  weak_skills: { skill: string; student_count: number }[];
}

export interface InstitutionReport {
  subject_difficulty: { subject: string; difficulty_score: number }[];
  progress_trends: { date: string; avg_score: number }[];
  exam_prep_status: { status: string; count: number }[];
}
