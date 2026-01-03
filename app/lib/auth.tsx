import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
    getAuth,
    type Auth,
    type AuthError,
} from "firebase/auth";
import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { auth, firebaseConfig } from "./firebase";
import { getUsuarioById, type Usuario } from "./firestore";

interface AuthContextType {
    user: User | null;
    userProfile: Usuario | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    registerUser: (email: string, password: string) => Promise<string>;
    signOut: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore
                try {
                    const profile = await getUsuarioById(firebaseUser.uid);
                    setUserProfile(profile);
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const authError = err as AuthError;
            console.error("Sign in error:", authError);
            if (authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password") {
                setError("Email o contraseña incorrectos");
            } else if (authError.code === "auth/invalid-credential") {
                setError("Credenciales inválidas");
            } else if (authError.code === "auth/too-many-requests") {
                setError("Demasiados intentos. Intente más tarde.");
            } else {
                setError("Error al iniciar sesión: " + authError.message);
            }
            throw authError;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registers a new user using a secondary Firebase App instance.
     * This prevents the current admin session from being signed out.
     */
    const registerUser = async (email: string, password: string): Promise<string> => {
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

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (err) {
            console.error("Sign out error:", err);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, userProfile, loading, signIn, registerUser, signOut, error }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
