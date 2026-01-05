import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC0nPZCxDmxoUA2LeZHvF4zizHkpY_4rLw",
  authDomain: "local-finder-d1e72.firebaseapp.com",
  projectId: "local-finder-d1e72",
  storageBucket: "local-finder-d1e72.firebasestorage.app",
  messagingSenderId: "460342604740",
  appId: "1:460342604740:web:eb1dcd1d2f7406aae52a91",
  measurementId: "G-JSDLSSSCTG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);