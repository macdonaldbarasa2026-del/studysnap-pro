import type { AgeGroup, UserProfile, View } from '../types';

type LearningMode = 'baby' | 'kids' | 'teen' | 'adult' | 'teacher' | 'researcher' | 'admin';

const AGE_RANK: Record<AgeGroup, number> = { baby: 0, kid: 1, teen: 2, adult: 3 };

/**
 * StudySnap's policy is intentionally conservative:
 * - age bands tune the learning experience and privacy defaults;
 * - trusted role determines privileged capabilities;
 * - stored learning_mode is presentation metadata, not an authorization source.
 *
 * This means a user can personalize the experience without using a client-side
 * mode switch to elevate themselves into teacher/admin/research features.
 */

const CORE: View[] = [
  'home', 'subject', 'note', 'scanner', 'flashcards', 'quiz', 'search',
  'favorites', 'recent', 'settings', 'help', 'about', 'offline', 'export',
  'notifications', 'academic-profile'
];

const EARLY_LEARNING: View[] = [
  'home', 'search', 'settings', 'help', 'about', 'notifications',
  'early-learning', 'kids-learning', 'videos', 'voice-tutor'
];

const KIDS: View[] = [
  ...CORE,
  'kids-learning', 'videos', 'learning-engine', 'problem-solver',
  'voice-tutor', 'revision-engine', 'daily-challenges', 'doubt-solver',
  'homework', 'academic-profile', 'bites'
];

const TEENS: View[] = [
  ...KIDS,
  'studysnap-ai', 'dashboard', 'handwriting-converter', 'exam-simulator',
  'career-finder', 'knowledge-battles', 'research-hub', 'bites', 'knowledge-map',
  'file-studio'
];

const ADULT_STUDENT: View[] = [
  ...TEENS,
  'studyroom', 'arena', 'league', 'ai-study-twin', 'research-hub',
  'institution-portal', 'campus', 'workspace-sync', 'auto-note-builder',
  'exam-simulator', 'marketplace', 'error-tracker', 'academic-timeline',
  'chats', 'updates', 'communities', 'calls', 'alchemy', 'file-studio'
];

const TEACHER: View[] = [
  ...CORE,
  'videos', 'dashboard', 'research-hub', 'institution-portal', 'campus',
  'workspace-sync', 'teacher-insights', 'institution-reports',
  'live-classroom', 'academic-timeline', 'notifications', 'knowledge-map',
  'studysnap-ai', 'auto-note-builder', 'error-tracker', 'bites', 'file-studio'
];

const RESEARCHER: View[] = [
  ...CORE,
  'videos', 'research-hub', 'problem-solver', 'ai-study-twin', 'workspace-sync',
  'academic-timeline', 'knowledge-map', 'studysnap-ai', 'auto-note-builder',
  'error-tracker', 'bites', 'file-studio'
];

const ADMIN: View[] = Array.from(new Set<View>([
  ...ADULT_STUDENT, ...TEACHER, ...RESEARCHER,
  'parent-mode', 'admin-inspection', 'institution-reports'
]));

const MINOR_SOCIAL_VIEWS = new Set<View>([
  'chats', 'communities', 'calls', 'studyroom', 'marketplace', 'arena', 'league', 'reputation'
]);

const HIGH_PRIVACY_VIEWS = new Set<View>([
  'marketplace', 'calls', 'communities', 'chats', 'studyroom'
]);

export type Capability =
  | 'core_learning'
  | 'ai_tutor'
  | 'voice_tutor'
  | 'web_research'
  | 'community'
  | 'live_classroom'
  | 'competitive_games'
  | 'career_tools'
  | 'marketplace'
  | 'institution_management'
  | 'teacher_analytics'
  | 'research_tools'
  | 'file_studio'
  | 'admin_tools';

export function getLearningMode(profile: UserProfile | null): LearningMode {
  if (!profile) return 'adult';
  if (profile.role === 'teacher' || profile.role === 'lecturer' || profile.role === 'institution_owner') return 'teacher';
  if (profile.role === 'researcher') return 'researcher';
  if (profile.role === 'admin') return 'admin';
  if (profile.age_group === 'baby') return 'baby';
  if (profile.age_group === 'kid') return 'kids';
  if (profile.age_group === 'teen') return 'teen';
  return 'adult';
}

export function isMinor(profile: UserProfile | null): boolean {
  return !!profile && profile.age_group !== 'adult';
}

export function isUnder13(profile: UserProfile | null): boolean {
  return !!profile && (profile.age_group === 'baby' || profile.age_group === 'kid');
}

export function getAllowedViews(profile: UserProfile | null): Set<View> {
  if (!profile) return new Set<View>(['login', 'onboarding', 'age-selection', 'role-selection']);
  const mode = getLearningMode(profile);
  let views: View[] = mode === 'baby'
    ? EARLY_LEARNING
    : mode === 'kids'
      ? KIDS
      : mode === 'teen'
        ? TEENS
        : mode === 'adult'
          ? ADULT_STUDENT
          : mode === 'teacher'
            ? TEACHER
            : mode === 'researcher'
              ? RESEARCHER
              : ADMIN;

  if (isMinor(profile)) {
    // Minors get learning-first defaults. Public/community and commerce surfaces
    // remain unavailable regardless of client navigation state.
    views = views.filter(v => !MINOR_SOCIAL_VIEWS.has(v));
    if (profile.age_group === 'teen' && !profile.institution_id) {
      views = views.filter(v => v !== 'live-classroom');
    }
  }

  if (profile.parental_lock) {
    views = views.filter(v => !HIGH_PRIVACY_VIEWS.has(v));
  }

  if (profile.role === 'student' && profile.age_group !== 'adult') {
    views = views.filter(v => v !== 'admin-inspection' && v !== 'institution-reports');
  }

  return new Set<View>(views);
}

export function canUseView(profile: UserProfile | null, view: View): boolean {
  return getAllowedViews(profile).has(view);
}

export function canUseCapability(profile: UserProfile | null, capability: Capability): boolean {
  if (!profile) return false;
  const mode = getLearningMode(profile);

  if (capability === 'admin_tools') return mode === 'admin';
  if (capability === 'institution_management') return mode === 'admin' || profile.role === 'institution_owner';
  if (capability === 'teacher_analytics') return mode === 'admin' || mode === 'teacher';
  if (capability === 'research_tools') return mode === 'researcher' || mode === 'teacher' || mode === 'admin' || (mode === 'adult' && profile.role === 'student');
  if (capability === 'file_studio') return canUseView(profile, 'file-studio');
  if (capability === 'community' || capability === 'marketplace') return !isMinor(profile) && canUseView(profile, capability === 'community' ? 'communities' : 'marketplace');
  if (capability === 'competitive_games') return !isMinor(profile) && canUseView(profile, 'arena');
  if (capability === 'live_classroom') return !isMinor(profile) || (!!profile.institution_id && profile.age_group === 'teen');
  if (capability === 'career_tools') return profile.age_group === 'adult' || profile.age_group === 'teen';
  if (capability === 'web_research') return profile.age_group === 'adult' || profile.age_group === 'teen' || mode === 'teacher' || mode === 'researcher' || mode === 'admin';
  if (capability === 'voice_tutor') return canUseView(profile, 'voice-tutor');
  if (capability === 'ai_tutor') return canUseView(profile, 'studysnap-ai') || canUseView(profile, 'voice-tutor');
  return canUseView(profile, 'home');
}

export function getModeDescription(profile: UserProfile | null): string {
  const mode = getLearningMode(profile);
  const labels: Record<LearningMode, string> = {
    baby: 'Early Learning',
    kids: 'Kids Learning',
    teen: 'Teen Student',
    adult: 'Adult Student',
    teacher: 'Teacher',
    researcher: 'Research',
    admin: 'Administrator',
  };
  return labels[mode];
}

export function getPolicySummary(profile: UserProfile | null): {
  mode: LearningMode;
  ageBand: AgeGroup | null;
  privacy: 'standard' | 'high';
  social: 'off' | 'supervised' | 'enabled';
  capabilities: Capability[];
} {
  if (!profile) {
    return { mode: 'adult', ageBand: null, privacy: 'high', social: 'off', capabilities: [] };
  }
  const minor = isMinor(profile);
  const capabilities: Capability[] = [
    'core_learning',
    'ai_tutor',
    ...(canUseCapability(profile, 'voice_tutor') ? ['voice_tutor' as Capability] : []),
    ...(canUseCapability(profile, 'web_research') ? ['web_research' as Capability] : []),
    ...(canUseCapability(profile, 'career_tools') ? ['career_tools' as Capability] : []),
    ...(canUseCapability(profile, 'competitive_games') ? ['competitive_games' as Capability] : []),
    ...(canUseCapability(profile, 'community') ? ['community' as Capability] : []),
    ...(canUseCapability(profile, 'institution_management') ? ['institution_management' as Capability] : []),
    ...(canUseCapability(profile, 'teacher_analytics') ? ['teacher_analytics' as Capability] : []),
    ...(canUseCapability(profile, 'research_tools') ? ['research_tools' as Capability] : []),
    ...(canUseCapability(profile, 'file_studio') ? ['file_studio' as Capability] : []),
    ...(canUseCapability(profile, 'admin_tools') ? ['admin_tools' as Capability] : []),
  ];
  return {
    mode: getLearningMode(profile),
    ageBand: profile.age_group,
    privacy: minor ? 'high' : 'standard',
    social: minor ? (profile.age_group === 'teen' && !!profile.institution_id ? 'supervised' : 'off') : 'enabled',
    capabilities,
  };
}

export function meetsAge(profile: UserProfile | null, minimum: AgeGroup): boolean {
  return !!profile && AGE_RANK[profile.age_group] >= AGE_RANK[minimum];
}
