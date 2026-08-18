import type { AgeGroup, UserProfile } from '../types';

export type AIUnderstanding = 'beginner' | 'intermediate' | 'advanced' | 'professional';

const ROLE_LABELS: Record<UserProfile['role'], string> = {
  student: 'Student',
  teacher: 'Teacher',
  lecturer: 'Lecturer',
  researcher: 'Researcher',
  admin: 'Administrator',
  institution_owner: 'Institution owner',
};

const AGE_GUIDANCE: Record<AgeGroup, string> = {
  baby: 'Use very simple words, concrete examples, short sentences, and child-safe content. Avoid mature or frightening material.',
  kid: 'Use clear age-appropriate language, explain unfamiliar terms, and use examples that make learning concrete.',
  teen: 'Use clear teaching language with moderate academic terminology. Show reasoning and encourage independent thinking.',
  adult: 'Use normal adult professional language. Match complexity to the user’s apparent understanding rather than assuming expertise.',
};

function roleGuidance(role: UserProfile['role']): string {
  if (role === 'teacher' || role === 'lecturer') return 'Prefer professional depth, teaching strategies, assessment ideas, classroom-ready examples, and precise terminology.';
  if (role === 'researcher') return 'Prefer advanced technical depth, methodological nuance, evidence quality, competing explanations, and explicit uncertainty.';
  if (role === 'admin' || role === 'institution_owner') return 'Prefer concise professional language, operational implications, policy considerations, and clear next actions.';
  return 'Teach rather than merely dump answers. Show useful reasoning and practical examples.';
}

export function getDefaultUnderstanding(profile: UserProfile | null): AIUnderstanding {
  if (!profile) return 'intermediate';
  if (profile.role === 'researcher') return 'professional';
  if (profile.role === 'teacher' || profile.role === 'lecturer') return 'advanced';
  if (profile.age_group === 'baby' || profile.age_group === 'kid') return 'beginner';
  if (profile.age_group === 'teen') return 'intermediate';
  if (profile.reputation_level === 'expert' || profile.reputation_level === 'academic_master') return 'advanced';
  return 'intermediate';
}

export function buildAIProfileContext(profile: UserProfile | null, task?: string): string {
  if (!profile) {
    return 'USER CONTEXT: No verified profile context is available. Do not invent age, role, profession, qualifications, or identity. Use a broadly accessible explanation and ask when level matters.';
  }

  const understanding = getDefaultUnderstanding(profile);
  const role = ROLE_LABELS[profile.role] || 'User';

  return [
    'STUDYSNAP AI RESPONSE POLICY',
    `Verified age group: ${profile.age_group}`,
    `Verified role: ${role}`,
    `Default understanding level: ${understanding}`,
    `Learning mode: ${profile.learning_mode || 'derived from profile; do not treat this field as authorization'}`,
    AGE_GUIDANCE[profile.age_group],
    roleGuidance(profile.role),
    task ? `Current task: ${task}` : '',
    'Never claim the user has a qualification, occupation, institution, or expertise that is not present in the verified profile or conversation.',
    'Do not reveal or restate sensitive profile fields unless needed for the task.',
    'When the user appears more or less advanced than the default, adapt the explanation while staying within age and safety constraints.',
  ].filter(Boolean).join('\n');
}
