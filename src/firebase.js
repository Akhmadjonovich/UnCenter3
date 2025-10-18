// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBcf8ryhW2xxmg9lNXIXOiosTa_8ZXxFEA",
  authDomain: "uncenter-7e9b6.firebaseapp.com",
  databaseURL: "https://uncenter-16f01-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uncenter-7e9b6",
  storageBucket: "uncenter-7e9b6.firebasestorage.app",
  messagingSenderId: "954043239199",
  appId: "1:954043239199:web:869fe93e96dd34828f3e2a",
  measurementId: "G-L92TDXS135",
};

// Firebase init
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);


