import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCghkiORIiDvOOBQFdXptg64j90EqdDtkM",
  authDomain: "mangro-app.firebaseapp.com",
  projectId: "mangro-app",
  storageBucket: "mangro-app.firebasestorage.app",
  messagingSenderId: "539104559080",
  appId: "1:539104559080:web:a4b02a85f411a9c2ddee5d",
  measurementId: "G-QDY0NFV8EB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined'
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

// Enable offline persistence (browser only)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    }
  });
}

// Initialize Auth
// Initialize Auth
export const auth = getAuth(app);

import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
