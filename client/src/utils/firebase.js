
import { initializeApp } from "firebase/app";

import { getAuth,GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY ,
  authDomain: "interviewiq-ed4f3.firebaseapp.com",
  projectId: "interviewiq-ed4f3",
  storageBucket: "interviewiq-ed4f3.firebasestorage.app",
  messagingSenderId: "406332480351",
  appId: "1:406332480351:web:55eabfde8b2022d451b4ea",
  measurementId: "G-S0HLMQD22E"
};


const app = initializeApp(firebaseConfig); 
const auth = getAuth(app);

const provider = new GoogleAuthProvider()
export { auth ,provider }
