import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Funcție pentru înregistrare
export async function register(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Utilizator înregistrat:", userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Eroare înregistrare:", error.code, error.message);
        return { success: false, error: error.message };
    }
}

// Funcție pentru autentificare
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Autentificat:", userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Eroare autentificare:", error.code, error.message);
        return { success: false, error: error.message };
    }
}

// Funcție pentru deconectare
export async function logout() {
    try {
        await signOut(auth);
        console.log("Deconectat");
        return { success: true };
    } catch (error) {
        console.error("Eroare deconectare:", error);
        return { success: false, error: error.message };
    }
}

// Observator pentru starea de autentificare
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}