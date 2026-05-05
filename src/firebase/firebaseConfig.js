import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if we have real Firebase credentials
const hasRealFirebaseConfig = process.env.REACT_APP_FIREBASE_API_KEY && 
  process.env.REACT_APP_FIREBASE_API_KEY !== "demo-api-key" &&
  process.env.REACT_APP_FIREBASE_API_KEY !== "your-api-key";

// Firebase configuration
const firebaseConfig = hasRealFirebaseConfig ? {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
} : {
  // Demo configuration - these are fake values that won't cause errors
  apiKey: "AIzaSyDemoKey123456789",
  authDomain: "demo-project-12345.firebaseapp.com",
  projectId: "demo-project-12345",
  storageBucket: "demo-project-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase only if we have real credentials
let app, auth, db, storage;

if (hasRealFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
    auth = null;
    db = null;
    storage = null;
  }
} else {
  // Demo mode - no Firebase initialization
  console.log('Running in demo mode - Firebase not initialized');
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;
