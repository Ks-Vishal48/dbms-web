import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};
const enabled=Boolean(config.apiKey && config.authDomain);
let auth; if(enabled) auth=getAuth(initializeApp(config));
export const signInWithGoogle=()=>enabled?signInWithPopup(auth,new GoogleAuthProvider()):Promise.reject(new Error('Firebase is not configured'));
export { enabled };
