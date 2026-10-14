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
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Firebase Web Configuration from environment variables with fallback
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDykHJ5GPj69t1_26Zfyt_kbAmr1Xn511k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'expen-a96e6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'expen-a96e6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'expen-a96e6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '647724209062',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:647724209062:web:92241cecad5d345223b567',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7XGQ0SQY2C'
};

/**
 * Check whether Firebase is properly configured
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
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    // Initialize Analytics safely if in browser and supported
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {
        // Analytics not supported or blocked (e.g. adblocker)
      });
    }
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

export { app, auth, db, storage, analytics, googleProvider };
