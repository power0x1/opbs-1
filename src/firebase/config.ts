import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCOUM0pfngAXrItPPEyXKKXxmgHk3mJY0E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'esp32-liquide.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://esp32-liquide-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'esp32-liquide',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'esp32-liquide.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '240804424672',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:240804424672:web:8d010114c7c84773b05985',
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export { app };
