import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Note, Subject, UserProfile, Flashcard } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function cleanObject(obj: any) {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isOffline = error instanceof Error && (error.message.includes('offline') || error.message.includes('backend'));
  const isPermissionError = error instanceof Error && error.message.includes('insufficient permissions');

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionError) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else if (isOffline) {
    console.warn('Firestore Offline: ', error instanceof Error ? error.message : String(error));
    // Don't throw for offline errors to allow app to function in offline/transient state
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}

export const DataService = {
  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null | undefined> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      // Return undefined to indicate a transient error (e.g. offline)
      return undefined;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${auth.currentUser?.uid}`;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      // Firebase Anonymous Auth has no email address. Firestore rules require a
      // string email field, so persist an empty string for guests rather than null.
      // This also makes onboarding deterministic across guest/Google/Apple auth.
      await setDoc(doc(db, 'users', auth.currentUser.uid), cleanObject({
        ...profile,
        email: auth.currentUser.email ?? '',
        created_at: serverTimestamp(),
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },


  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const uid = auth.currentUser?.uid;
    const path = uid ? `users/${uid}` : 'users/unknown';
    try {
      if (!uid) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'users', uid), cleanObject({ ...profile, updated_at: serverTimestamp() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
      throw e;
    }
  },

  async getFlashcards(noteId?: string): Promise<Flashcard[]> {
    const path = 'flashcards';
    try {
      if (!auth.currentUser) return [];
      const constraints: any[] = [where('owner_id', '==', auth.currentUser.uid)];
      if (noteId) constraints.push(where('note_id', '==', noteId));
      const q = query(collection(db, 'flashcards'), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Flashcard));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); return []; }
  },

  async saveFlashcards(noteId: string, cards: Array<Pick<Flashcard, 'question' | 'answer'>>): Promise<Flashcard[]> {
    const path = `flashcards/${noteId}`;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const saved: Flashcard[] = [];
      for (const card of cards) {
        const id = crypto.randomUUID();
        await setDoc(doc(db, 'flashcards', id), cleanObject({ id, note_id: noteId, owner_id: auth.currentUser.uid, question: card.question, answer: card.answer, created_at: serverTimestamp() }));
        saved.push({ id, note_id: noteId, question: card.question, answer: card.answer, created_at: new Date().toISOString() });
      }
      return saved;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); throw e; }
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const path = 'subjects';
    try {
      if (!auth.currentUser) return [];
      const q = query(collection(db, 'subjects'), where('owner_id', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createSubject(name: string, color: string): Promise<Subject> {
    const id = crypto.randomUUID();
    const path = `subjects/${id}`;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const newSub = {
        id,
        owner_id: auth.currentUser.uid,
        name,
        color,
        created_at: serverTimestamp(),
      };
      await setDoc(doc(db, 'subjects', id), newSub);
      return newSub as any;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  // Notes
  async getNotes(subjectId: string): Promise<Note[]> {
    const path = 'notes';
    try {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, 'notes'), 
        where('owner_id', '==', auth.currentUser.uid),
        where('subject_id', '==', subjectId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createNote(note: Partial<Note>): Promise<Note> {
    const id = crypto.randomUUID();
    const path = `notes/${id}`;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      const newNote = {
        ...note,
        id,
        owner_id: auth.currentUser.uid,
        created_at: serverTimestamp(),
      };
      await setDoc(doc(db, 'notes', id), newNote);
      return newNote as any;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const path = `notes/${noteId}`;
    try {
      const docRef = doc(db, 'notes', noteId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    const path = `notes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async getFavoriteNotes(): Promise<Note[]> {
    const path = 'notes';
    try {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, 'notes'), 
        where('owner_id', '==', auth.currentUser.uid),
        where('is_favorite', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async getRecentNotes(limitCount: number = 5): Promise<Note[]> {
    const path = 'notes';
    try {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, 'notes'), 
        where('owner_id', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      return notes.sort((a: any, b: any) => {
        const timeA = a.created_at instanceof Timestamp ? a.created_at.toMillis() : new Date(a.created_at).getTime();
        const timeB = b.created_at instanceof Timestamp ? b.created_at.toMillis() : new Date(b.created_at).getTime();
        return timeB - timeA;
      }).slice(0, limitCount);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async logActivity(activity: any): Promise<void> {
    const id = crypto.randomUUID();
    const path = `activities/${id}`;
    try {
      if (!auth.currentUser) return;
      await setDoc(doc(db, 'activities', id), cleanObject({
        ...activity,
        id,
        owner_id: auth.currentUser.uid,
        created_at: serverTimestamp(),
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async searchNotes(queryStr: string): Promise<Note[]> {
    const path = 'notes';
    try {
      if (!auth.currentUser) return [];
      const q = query(
        collection(db, 'notes'), 
        where('owner_id', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      return notes.filter(n => 
        n.title.toLowerCase().includes(queryStr.toLowerCase()) || 
        n.content.toLowerCase().includes(queryStr.toLowerCase())
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  }
};
