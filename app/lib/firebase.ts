import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Initialize Firebase safely for HMR
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics late to improve Lighthouse score
export const analytics =
    typeof window !== "undefined"
        ? (async () => {
              // Defer analytics initialization by 2 seconds or until the window is idle
              if (window.requestIdleCallback) {
                  await new Promise((res) => window.requestIdleCallback(res, { timeout: 3000 }));
              }
              const { getAnalytics, isSupported } = await import("firebase/analytics");
              const yes = await isSupported();
              return yes ? getAnalytics(app) : null;
          })()
        : null;

// Initialize Firestore with multi-tab offline persistence (modern API)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
