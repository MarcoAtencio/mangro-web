import { 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut,
    getAuth 
} from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { firebaseConfig } from "./firebase";

/**
 * Registers a new user using a secondary Firebase App instance.
 * This prevents the current admin session from being signed out.
 * 
 * This is moved to a separate file to avoid bloating the main Auth bundle
 * with secondary app initialization logic.
 */
export const registerUser = async (email: string, password: string): Promise<string> => {
    let secondaryApp;
    try {
        // Create a secondary app with a unique name
        secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        // Create user in the secondary app
        const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            password
        );
        const uid = userCredential.user.uid;

        // Sign out from the secondary app immediately just in case
        await firebaseSignOut(secondaryAuth);

        return uid;
    } catch (error) {
        console.error("Error creating user in secondary app:", error);
        throw error;
    } finally {
        // Clean up the secondary app
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};
