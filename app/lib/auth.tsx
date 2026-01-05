import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    onAuthStateChanged,
    type User,
    type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserById, type User as FirestoreUser } from "./firestore";



interface AuthContextType {
    user: User | null;
    userProfile: FirestoreUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user profile from Firestore
                try {
                    const profile = await getUserById(firebaseUser.uid);
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
            const { signInWithEmailAndPassword } = await import("firebase/auth");
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

    const sendPasswordResetEmail = async (email: string) => {
        try {
            const { sendPasswordResetEmail: firebaseSendPasswordResetEmail } = await import("firebase/auth");
            await firebaseSendPasswordResetEmail(auth, email);
        } catch (err) {
            console.error("Password reset error:", err);
            throw err;
        }
    };

    const signOut = async () => {
        try {
            const { signOut: firebaseSignOut } = await import("firebase/auth");
            await firebaseSignOut(auth);
        } catch (err) {
            console.error("Sign out error:", err);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, userProfile, loading, signIn, signOut, sendPasswordResetEmail, error }}
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
