import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Configuration Firebase — SDK v11 (CDN officiel gstatic).
// Pour éviter l'erreur 400 (identitytoolkit) : dans la Console Firebase →
// Authentication → Sign-in method → activer "E-mail/Mot de passe".
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "anssar-brand.firebaseapp.com",
  projectId: "anssar-brand",
  storageBucket: "anssar-brand.firebasestorage.app",
  messagingSenderId: "336874521717",
  appId: "1:336874521717:web:459a591c52bf7f8a11e43c",
  measurementId: "G-YELNL24ZFS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  app,
  analytics,
  db,
  auth,
  // Firestore helpers
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  // Auth helpers
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};

