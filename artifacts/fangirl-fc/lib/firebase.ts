import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket ?? "",
    messagingSenderId: messagingSenderId ?? "",
    appId,
  };
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _functions: Functions | null = null;

function getApp(): FirebaseApp | null {
  if (_app) return _app;
  const config = readConfig();
  if (!config) return null;
  try {
    _app = getApps().length ? getApps()[0]! : initializeApp(config);
    return _app;
  } catch (err) {
    console.warn("Firebase init failed", err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return readConfig() !== null;
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (_db) return _db;
  const app = getApp();
  if (!app) return null;
  try {
    _db = getFirestore(app);
    return _db;
  } catch (err) {
    console.warn("Firestore init failed", err);
    return null;
  }
}

// Returns the Firebase Functions instance (us-central1 region, v2 callable).
// Returns null server-side or when Firebase is not configured.
export function getFirebaseFunctions(): Functions | null {
  if (typeof window === "undefined") return null;
  if (_functions) return _functions;
  const app = getApp();
  if (!app) return null;
  try {
    _functions = getFunctions(app, "us-central1");
    return _functions;
  } catch (err) {
    console.warn("Firebase Functions init failed", err);
    return null;
  }
}
