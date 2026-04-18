// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI0VSHiW_5eo19btIc5LyrjDZmw2Oh3Io",
  authDomain: "cse3mad-assignmnet4.firebaseapp.com",
  projectId: "cse3mad-assignmnet4",
  storageBucket: "cse3mad-assignmnet4.firebasestorage.app",
  messagingSenderId: "576432509599",
  appId: "1:576432509599:web:a04de548109434796908aa",
  measurementId: "G-WPM9JX5W7C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app)