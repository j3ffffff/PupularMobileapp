import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these placeholders with your real Firebase project config before enabling auth/sync.
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'pupular-5affc.firebaseapp.com',
  projectId: 'pupular-5affc',
  storageBucket: 'pupular-5affc.firebasestorage.app',
  messagingSenderId: '826886872344',
  appId: '1:826886872344:web:d881249a28b4e92d0bd26d',
};

let app = null;
let auth = null;
let db = null;

const hasPlaceholderValue = (value) => (
  !value || value.startsWith('YOUR_') || value.includes('...')
);

const isConfigured = ![
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].some(hasPlaceholderValue);

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
