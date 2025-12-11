import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update }
  from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA39fMUtoN5qWyR69VxJxsQAIQ1erUEfWQ",
  authDomain: "project-dcbcd.firebaseapp.com",
  projectId: "project-dcbcd",
  storageBucket: "project-dcbcd.firebasestorage.app",
  messagingSenderId: "967056031660",
  appId: "1:967056031660:web:66b9a8130d9d778f148409",
  databaseURL: "https://project-dcbcd-default-rtdb.firebaseio.com/"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, push, onValue, update };
