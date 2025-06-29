// Firebase Authentication Setup (Ready for Integration)
// This file contains the configuration for Firebase Auth integration

// Note: Firebase Auth is prepared but not active in demo mode
// To activate: Update environment variables and uncomment the code below

/*
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.log('Auth emulator already connected');
  }
}

export default app;
*/

// Demo Mode Authentication (Current Implementation)
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export const demoUser: User = {
  uid: 'demo-user-123',
  email: 'demo@fikalearn.com',
  displayName: 'Demo User',
  photoURL: undefined
};

// Demo authentication functions
export const signInWithEmailAndPassword = async (email: string, password: string): Promise<User> => {
  // Demo implementation - replace with Firebase auth when ready
  if (email === 'demo@fikalearn.com' && password === 'demo123') {
    return demoUser;
  }
  throw new Error('Invalid credentials');
};

export const signOut = async (): Promise<void> => {
  // Demo implementation
  console.log('User signed out (demo mode)');
};

export const getCurrentUser = (): User | null => {
  // Demo implementation - always return demo user
  return demoUser;
};

// Firebase Auth Integration Guide:
// 1. Create Firebase project at https://console.firebase.google.com
// 2. Enable Authentication with Email/Password provider
// 3. Update environment variables in .env.local:
//    - NEXT_PUBLIC_FIREBASE_API_KEY
//    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
//    - NEXT_PUBLIC_FIREBASE_PROJECT_ID
//    - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
//    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
//    - NEXT_PUBLIC_FIREBASE_APP_ID
// 4. Uncomment the Firebase configuration above
// 5. Replace demo functions with actual Firebase auth calls
// 6. Update Navigation component to use real auth state
// 7. Add login/signup pages (/login, /signup)
// 8. Implement protected routes middleware

export const isAuthEnabled = false; // Set to true when Firebase is configured 