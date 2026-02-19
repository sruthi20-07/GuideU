import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDmWb5LrrLE2qe1OfZJXihQOwZ3o_VaIQI",
  authDomain: "guideu-12837.firebaseapp.com",
  projectId: "guideu-12837",
  storageBucket: "guideu-12837.firebasestorage.app",
  messagingSenderId: "586951980360",
  appId: "1:586951980360:web:f38ab3c883783573c1af7d",
  measurementId: "G-B7DJD6WVEM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const messaging = getMessaging(app);

