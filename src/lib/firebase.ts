import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider, 
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
// Guarantee that sessions persist across browser restarts and tabs
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const storage = getStorage(app);

// Connection test as per instructions
export async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log("Neural Link Stable (Firestore Connected)");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('backend'))) {
      console.warn("Neural Link Interrupted (Operating in Offline Mode)");
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let isLoginInProgress = false;

export const signInWithGoogle = async () => {
  if (isLoginInProgress) {
    console.warn("Login request already in progress, ignoring duplicate call.");
    return null;
  }
  isLoginInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.warn("Google sign-in attempt code:", error?.code || error?.message);
    throw error;
  } finally {
    isLoginInProgress = false;
  }
};

export const signInWithApple = async () => {
  if (isLoginInProgress) {
    console.warn("Login request already in progress, ignoring duplicate call.");
    return null;
  }
  isLoginInProgress = true;
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result;
  } catch (error: any) {
    console.warn("Apple sign-in attempt code:", error?.code || error?.message);
    throw error;
  } finally {
    isLoginInProgress = false;
  }
};


export const signInWithMicrosoft = async () => {
  if (isLoginInProgress) return null;
  isLoginInProgress = true;
  try { return await signInWithPopup(auth, microsoftProvider); }
  finally { isLoginInProgress = false; }
};

export const signInWithGithub = async () => {
  if (isLoginInProgress) return null;
  isLoginInProgress = true;
  try { return await signInWithPopup(auth, githubProvider); }
  finally { isLoginInProgress = false; }
};

export const signInWithPhone = async (phoneNumber: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
  if (isLoginInProgress) throw new Error('Authentication already in progress');
  isLoginInProgress = true;
  try { return await signInWithPhoneNumber(auth, phoneNumber, verifier); }
  finally { isLoginInProgress = false; }
};

export const signInAsGuest = async () => {
  if (isLoginInProgress) return null;
  isLoginInProgress = true;
  try {
    const result = await signInAnonymously(auth);
    return result;
  } catch (error: any) {
    console.warn("Guest sign-in error:", error);
    throw error;
  } finally {
    isLoginInProgress = false;
  }
};

export const logout = () => signOut(auth);

export { onAuthStateChanged };
export type { User };
