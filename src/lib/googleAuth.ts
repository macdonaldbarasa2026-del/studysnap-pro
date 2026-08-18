import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Request Workspace scopes
googleProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.me');
googleProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Firebase authentication and Google Workspace OAuth are separate.
      // Do not treat a Firebase-authenticated user as Workspace-connected unless
      // an in-memory Google access token is actually available.
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getGoogleAuthToken = async (): Promise<string> => {
  try {
    isSigningIn = true;
    
    // Automatically use the currently signed-in user's email to skip the account selection screen
    if (auth.currentUser?.email) {
      googleProvider.setCustomParameters({
        login_hint: auth.currentUser.email
      });
    }

    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    
    // Keep the Google OAuth access token in memory only. OAuth access tokens are
    // bearer credentials; persisting them in localStorage would expose them to
    // any JavaScript that later executes in the origin. A page reload should
    // require a fresh Workspace consent/session rather than resurrecting a token.

    return cachedAccessToken;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
