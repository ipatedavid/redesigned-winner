// Importă funcțiile necesare din SDK-urile Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configurația ta Firebase (înlocuiește cu datele tale)
const firebaseConfig = {
    apiKey: "AIzaSyCVq2LZ3af2J5fSPUMfs8K53g4m5X7tLqY",
    authDomain: "kwdt-8319d.firebaseapp.com",
    projectId: "kwdt-8319d",
    storageBucket: "kwdt-8319d.firebasestorage.app",
    messagingSenderId: "391727058620",
    appId: "1:391727058620:web:0e63b6c4ee85cc241f0ab9",
    measurementId: "G-SZP4QVC18K"
};

// Inițializează Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };