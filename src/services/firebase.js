import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 Replace with your Firebase project config
// Firebase Console → Project Settings → General → Your apps → Config
const firebaseConfig = {
  apiKey: 'AIzaSyAcT2JOFPPAFahau5RsLJI0AS_cHUP3_yE',
  authDomain: 'pupular-5affc.firebaseapp.com',
  projectId: 'pupular-5affc',
  storageBucket: 'pupular-5affc.firebasestorage.app',
  messagingSenderId: '826886872344',
  appId: '1:826886872344:web:d881249a28b4e92d0bd26d',
};

let app = null;
let auth = null;
let db = null;

const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_');

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase initialization failed:', e.message);
  }
}

export { auth, db };
