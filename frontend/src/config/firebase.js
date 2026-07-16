// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALKNyZ4fvj9ZJUM69XAUgcYGrPA8iW2-4",
  authDomain: "kingswood-connect.firebaseapp.com",
  projectId: "kingswood-connect",
  storageBucket: "kingswood-connect.firebasestorage.app",
  messagingSenderId: "129445788589",
  appId: "1:129445788589:web:d52a86f373445d06e2bf24",
  measurementId: "G-PFQEF9L4Q5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);