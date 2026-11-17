
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBGsO5w3JMFQP3WFh_T7d9K1w8-Bzacg4w",
  authDomain: "proyecto-d3e3f.firebaseapp.com",
  databaseURL: "https://proyecto-d3e3f-default-rtdb.firebaseio.com",
  projectId: "proyecto-d3e3f",
  storageBucket: "proyecto-d3e3f.firebasestorage.app",
  messagingSenderId: "649515855620",
  appId: "1:649515855620:web:39eb7ebb9f0ae58fddaa51",
  measurementId: "G-7DLCHSPLDZ"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
