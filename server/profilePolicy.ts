import admin from 'firebase-admin';

export type ProfileAgeGroup = 'baby' | 'kid' | 'teen' | 'adult';
export type ProfileRole = 'student' | 'teacher' | 'lecturer' | 'researcher' | 'admin' | 'institution_owner';

export interface TrustedProfile {
  age_group: ProfileAgeGroup;
  role: ProfileRole;
  institution_id?: string;
  parental_lock?: boolean;
}

const CHILD_BLOCKED_AI = new Set([
  '/maps-grounding',
  '/generate-video',
  '/video-download',
  '/high-thinking',
]);

export async function getTrustedProfile(uid: string): Promise<TrustedProfile | null> {
  const snap = await admin.firestore().collection('users').doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  const age = data.age_group;
  const role = data.role;
  if (!['baby', 'kid', 'teen', 'adult'].includes(age)) return null;
  if (!['student', 'teacher', 'lecturer', 'researcher', 'admin', 'institution_owner'].includes(role)) return null;
  return {
    age_group: age,
    role,
    institution_id: typeof data.institution_id === 'string' ? data.institution_id : undefined,
    parental_lock: Boolean(data.parental_lock),
  } as TrustedProfile;
}

export async function enforceAIProfilePolicy(req: any, res: any, next: any) {
  try {
    const uid = req.uid as string | undefined;
    if (!uid) return res.status(401).json({ error: 'Authenticated profile required.' });
    const profile = await getTrustedProfile(uid);
    if (!profile) return res.status(403).json({ error: 'Complete a StudySnap learning profile before using AI tools.' });

    req.studySnapProfile = profile;
    const path = String(req.path || '');
    const isMinor = profile.age_group !== 'adult';
    if (isMinor && CHILD_BLOCKED_AI.has(path)) {
      return res.status(403).json({
        error: 'This AI capability is not available for the current age mode.',
        code: 'AGE_MODE_RESTRICTED'
      });
    }

    // Child profiles receive a learning-first system policy at the server boundary.
    if (isMinor) req.studySnapChildSafe = true;
    next();
  } catch (error) {
    console.error('[Profile Policy Error]:', error);
    return res.status(503).json({ error: 'Profile policy could not be evaluated safely.' });
  }
}
