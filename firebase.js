
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8lEWaXRzLM4y7Cgkl_YfjesLFoAcPfhQ",
  authDomain: "thinkfix.firebaseapp.com",
  projectId: "thinkfix",
  storageBucket: "thinkfix.firebasestorage.app",
  messagingSenderId: "208173265917",
  appId: "1:208173265917:web:5a94c7ad29f2f402401f94",
  measurementId: "G-ELEKSS25DX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
