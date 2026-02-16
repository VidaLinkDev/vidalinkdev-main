// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkJTrS91d6Fga8pbQf7hN97LnED7EX7xc",
  authDomain: "vidalink-v2.firebaseapp.com",
  projectId: "vidalink-v2",
  storageBucket: "vidalink-v2.firebasestorage.app",
  messagingSenderId: "361194406862",
  appId: "1:361194406862:web:4bd4f4157efbc29fbce19f",
  measurementId: "G-MV4CDET1F2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export commonly used services
export const auth = getAuth(app);
export const db = getFirestore(app);