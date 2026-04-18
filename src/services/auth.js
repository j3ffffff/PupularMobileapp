import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  OAuthProvider, signInWithCredential,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile, signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithApple() {
  if (!auth) throw new Error('Firebase is not configured. Add your config to src/services/firebase.js');

  const nonce = Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  const oAuthCredential = new OAuthProvider('apple.com').credential({
    idToken: appleCredential.identityToken,
    rawNonce: nonce,
  });

  const result = await signInWithCredential(auth, oAuthCredential);

  const displayName = appleCredential.fullName
    ? [appleCredential.fullName.givenName, appleCredential.fullName.familyName]
        .filter(Boolean).join(' ')
    : null;

  return { user: result.user, displayName };
}

export async function signUpWithEmail(email, password, name) {
  if (!auth) throw new Error('Firebase is not configured.');

  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(result.user, { displayName: name });
  }
  return { user: result.user, displayName: name || null };
}

export async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase is not configured.');

  const result = await signInWithEmailAndPassword(auth, email, password);
  return { user: result.user, displayName: result.user.displayName || null };
}

export async function resetPassword(email) {
  if (!auth) throw new Error('Firebase is not configured.');
  await sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}
