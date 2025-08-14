import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase конфигурация для проекта "Аксора"
const firebaseConfig = {
  apiKey: "AIzaSyAFijjedgtsOjSgeAr0mrK4LnP2faMFvO4",
  authDomain: "anonchat-axora.firebaseapp.com",
  projectId: "anonchat-axora",
  storageBucket: "anonchat-axora.firebasestorage.app",
  messagingSenderId: "824675423947",
  appId: "1:824675423947:web:c6615e73969d8a1152ed4e",
  measurementId: "G-3FTRLPH1R6"
};

// App singleton (safe with Fast Refresh)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth singleton (safe with Fast Refresh)
declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_AUTH: any | undefined;
}

let _auth = global.FIREBASE_AUTH;
// If no auth yet, initialize
if (!_auth) {
  _auth = getAuth(app);
  global.FIREBASE_AUTH = _auth;
}
export const auth = _auth;

// Firestore bound to the same app
export const db: Firestore = getFirestore(app);
export const storage = getStorage(app);

// Подключение к реальному Firebase серверу
// Эмуляторы отключены - используем продакшн

// TODO: App Check (Play Integrity) will be enabled later. For now, it is intentionally disabled for Dev Client.
// App Check is disabled to avoid issues with Expo Dev Client and development environment.

// Проверка конфигурации
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
};

export default app;
