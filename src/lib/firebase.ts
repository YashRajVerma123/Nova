// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "nova-blog-ipybx",
  "appId": "1:1044205513293:web:9c83b54d417a893dde8a04",
  "storageBucket": "nova-blog-ipybx.firebasestorage.app",
  "apiKey": "AIzaSyCk2nztaRVJ3Jsu0PZyUf3oGjY3uklCn6k",
  "authDomain": "nova-blog-ipybx.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1044205513293"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
