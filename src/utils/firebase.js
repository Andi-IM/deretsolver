// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmfQUl0LgFk5pQl95Yos3-hQyygPdReIc",
  authDomain: "deretsolver.firebaseapp.com",
  projectId: "deretsolver",
  storageBucket: "deretsolver.firebasestorage.app",
  messagingSenderId: "214283161090",
  appId: "1:214283161090:web:6608e6f243200bb054a11b",
  measurementId: "G-G93KT3SBQP",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
