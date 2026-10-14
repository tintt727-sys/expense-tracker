import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase Web Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

/**
 * Check whether Firebase is properly configured in .env
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== ''
  );
};

// Initialize Firebase App safely (singleton)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn(
    '⚠️ Firebase is not configured yet. Please add your credentials in frontend/.env'
  );
}

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    throw new Error(
      'Firebase is not configured yet. Please set VITE_FIREBASE_API_KEY in frontend/.env'
    );
  }

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

/**
 * Sign out Firebase user
 */
export const logoutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Sign in with Email and Password via Firebase Auth
 */
export const loginWithFirebaseEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase Auth is not configured in frontend/.env');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

/**
 * Register with Email and Password via Firebase Auth
 */
export const registerWithFirebaseEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase Auth is not configured in frontend/.env');
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export { app, auth, db, storage, googleProvider };
