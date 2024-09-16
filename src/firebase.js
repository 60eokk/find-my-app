import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDz_ZkxfgkRZCOG94UlVJMkrKkASI2PcRs",
  authDomain: "find-my-app-107db.firebaseapp.com",
  projectId: "find-my-app-107db",
  storageBucket: "find-my-app-107db.appspot.com",
  messagingSenderId: "115773395980",
  appId: "1:115773395980:web:b76bc9f91814c8d4d88a29",
  measurementId: "G-S7HPEK5M5T"
};

const app = initializeApp(firebaseConfig); // default from Firebase console
const analytics = getAnalytics(app); // default from Firebase console

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider(); // Initialize Google Auth Provider