// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "nova-blog-ipybx",
  "appId": "1:1044205513293:web:9c83b54d417a893dde8a04",
  "storageBucket": "nova-blog-ipybx.appspot.com",
  "apiKey": "AIzaSyCk2nztaRVJ3Jsu0PZyUf3oGjY3uklCn6k",
  "authDomain": "nova-blog-ipybx.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1044205513293"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
