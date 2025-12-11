import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPRYpqbk7Lx-NMQWM4DdKV7SbCzmsliiY",
  authDomain: "ferias-central.firebaseapp.com",
  projectId: "ferias-central",
  storageBucket: "ferias-central.firebasestorage.app",
  messagingSenderId: "844054036270",
  appId: "1:844054036270:web:b2e0e3eaff5b051d3dc4bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);