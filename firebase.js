// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA39fMUtoN5qWyR69VxJxsQAIQ1erUEfWQ",
  authDomain: "project-dcbcd.firebaseapp.com",
  projectId: "project-dcbcd",
  storageBucket: "project-dcbcd.firebasestorage.app",
  messagingSenderId: "967056031660",
  appId: "1:967056031660:web:66b9a8130d9d778f148409",
  measurementId: "G-8JE0K0L2NE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);