import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const enabled = Boolean(config.apiKey && config.authDomain && config.apiKey !== '');

let auth = null;
if (enabled) {
  try {
    const app = initializeApp(config);
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export const signInWithGoogle = () => {
  if (!enabled || !auth) {
    return Promise.reject(new Error('Firebase is not configured. Please add your Firebase keys to client/.env'));
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signUpWithEmail = async (name, email, password) => {
  if (!enabled || !auth) {
    throw new Error('Firebase is not configured. Please add your Firebase keys to client/.env');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  return userCredential.user;
};

export const loginWithEmail = async (email, password) => {
  if (!enabled || !auth) {
    throw new Error('Firebase is not configured. Please add your Firebase keys to client/.env');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = () => {
  if (enabled && auth) {
    return signOut(auth);
  }
  return Promise.resolve();
};

export const resetPassword = (email) => {
  if (!enabled || !auth) {
    return Promise.reject(new Error('Firebase is not configured.'));
  }
  return sendPasswordResetEmail(auth, email);
};

export const onAuthChange = (callback) => {
  if (enabled && auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
};

export { enabled, auth };
