import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    type DocumentData,
    type QuerySnapshot
} from "firebase/firestore";
import { db } from "./firebase";

// Types based on Firestore structure
export interface Usuario {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    photo_url: string;
    role: "ADMIN" | "TECNICO" | "SUPERVISOR";
    fcm_token?: string;
    created_at: Timestamp | Date;
}

export interface Cliente {
    id: string;
    name: string;
    ruc?: string;
    address: string;
    phone?: string;
    email?: string;
    contact_name?: string;
}

export interface Equipo {
    id: string;
    cliente_id: string;
    nombre: string;
    modelo: string;
    serie: string;
    ultimo_mantenimiento: Timestamp | Date;
    estado: "activo" | "mantenimiento" | "inactivo";
}

export interface Informe {
    id: string;
    cliente_id: string;
    equipo_id: string;
    tecnico_id: string;
    fecha: Timestamp | Date;
    estado: "pendiente" | "completado" | "revision";
    fotos_antes: string[];
    fotos_despues: string[];
    descripcion: string;
}

// ============ USUARIOS ============

export async function getUsuarios(): Promise<Usuario[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Usuario[];
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Usuario;
    }
    return null;
}

export async function getTecnicos(): Promise<Usuario[]> {
    const q = query(collection(db, "users"), where("role", "==", "TECNICO"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Usuario[];
}

import { setDoc } from "firebase/firestore";

// ... (imports remain the same, just adding setDoc)

export async function createUsuario(data: Omit<Usuario, "id">, customUid?: string): Promise<string> {
    if (customUid) {
        // If a custom UID is provided (from Auth), use it as the document ID
        const docRef = doc(db, "users", customUid);
        await setDoc(docRef, {
            ...data,
            created_at: Timestamp.now(),
        });
        return customUid;
    } else {
        // Fallback to random ID (should be avoided for users, but kept for compatibility)
        const docRef = await addDoc(collection(db, "users"), {
            ...data,
            created_at: Timestamp.now(),
        });
        return docRef.id;
    }
}

export async function updateUsuario(id: string, data: Partial<Usuario>): Promise<void> {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, data);
}

export async function deleteUsuario(id: string): Promise<void> {
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
}

// Real-time listener for users with error handling
export function subscribeToUsuarios(
    callback: (usuarios: Usuario[]) => void,
    onError?: (error: { code: string; message: string }) => void
): () => void {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
            const usuarios = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Usuario[];
            callback(usuarios);
        },
        (error) => {
            console.error("Firestore subscription error:", error);
            onError?.({ code: error.code, message: error.message });
        }
    );
    return unsubscribe;
}

// ============ CLIENTES ============

export async function getClientes(): Promise<Cliente[]> {
    const querySnapshot = await getDocs(collection(db, "companies"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Cliente[];
}

export function subscribeToClientes(
    callback: (clientes: Cliente[]) => void
): () => void {
    const unsubscribe = onSnapshot(collection(db, "companies"), (snapshot) => {
        const clientes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Cliente[];
        callback(clientes);
    });
    return unsubscribe;
}

// ============ ESTADÍSTICAS ============

export async function getDashboardStats() {
    const [usuariosSnap, clientesSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "companies")),
    ]);

    const usuarios = usuariosSnap.docs.map((d) => d.data());
    const tecnicos = usuarios.filter((u) => u.role === "TECNICO");

    return {
        tecnicosTotal: tecnicos.length,
        tecnicosActivos: tecnicos.length, // Could filter by status if field exists
        clientesTotal: clientesSnap.size,
        usuariosTotal: usuariosSnap.size,
    };
}

// Helper to format Firestore Timestamp
export function formatFirestoreDate(date: Timestamp | Date | undefined): string {
    if (!date) return "N/A";
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
