// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhIULc5F1V4dIxA6aek6d2Dc3ZkEDr6YE",
  authDomain: "qusamba-deab1.firebaseapp.com",
  projectId: "qusamba-deab1",
  storageBucket: "qusamba-deab1.firebasestorage.app",
  messagingSenderId: "359553322599",
  appId: "1:359553322599:web:276a7e94148b4ec218cec2",
  measurementId: "G-5WRK4EMZL7"
};

// Initialize Firebase
const app =  getApps().length ===0? initializeApp(firebaseConfig) : getApp();
const auth = getAuth
const analytics = getAnalytics(app);

export {  auth, analytics };