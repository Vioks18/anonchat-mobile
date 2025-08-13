import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);

// Подключение к реальному Firebase серверу
// Эмуляторы отключены - используем продакшн

// Проверка конфигурации
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
};

export default app;
