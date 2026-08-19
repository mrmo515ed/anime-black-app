import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with resilient multi-tab local cache and auto-detect long polling
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalAutoDetectLongPolling: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  try {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    }, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = dbInstance;
export const auth = getAuth(app);

// Validation / non-blocking test connection
export async function testConnection() {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return;
  }
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error: any) {
    // Silently continue in offline/cached mode
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

