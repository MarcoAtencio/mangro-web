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
    GeoPoint,
    type DocumentData,
    type QuerySnapshot,
    setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Re-export types from centralized location for backwards compatibility
export type { 
    User, 
    Client, 
    Equipment, 
    CreateClientDTO, 
    UpdateClientDTO,
    CreateEquipmentDTO,
    UpdateEquipmentDTO,
    Template,
    CreateTemplateDTO,
    UpdateTemplateDTO,
    ServiceType,
    Report
} from "~/types";

// Import types for internal use
import type { 
    User, 
    Client, 
    Equipment, 
    CreateClientDTO, 
    UpdateClientDTO,
    CreateEquipmentDTO,
    UpdateEquipmentDTO,
    Template,
    CreateTemplateDTO,
    UpdateTemplateDTO,
    ServiceType
} from "~/types";



// ============ USERS ============

export async function getUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Map legacy fields if necessary during migration, or expect migration
        fullName: doc.data().full_name || doc.data().fullName,
        photoUrl: doc.data().photo_url || doc.data().photoUrl,
        createdAt: doc.data().created_at || doc.data().createdAt,
    })) as User[];
}

export async function getUserById(id: string): Promise<User | null> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            fullName: data.full_name || data.fullName,
            photoUrl: data.photo_url || data.photoUrl,
            createdAt: data.created_at || data.createdAt,
        } as User;
    }
    return null;
}

export async function getTechnicians(): Promise<User[]> {
    // Note: Assuming 'role' value in DB might still be Spanish "TECNICO" for a while or checking both
    // For now, let's look for both or strict English if migration is assumed. 
    // Plan implied full refactor, but data might be old. Let's query for what's likely there.
    // Ideally we update the query to match new role names if we change data, but let's keep string lit "TECNICO" mapped to logic.
    // Actually, type def says "TECHNICIAN", so let's use that, but we might need to handle legacy data.
    const q = query(collection(db, "users"), where("role", "in", ["TECNICO", "TECHNICIAN"]));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fullName: doc.data().full_name || doc.data().fullName,
        photoUrl: doc.data().photo_url || doc.data().photoUrl,
        createdAt: doc.data().created_at || doc.data().createdAt,
    })) as User[];
}

export async function createUser(
    data: Omit<User, "id" | "createdAt">,
    customUid?: string
): Promise<string> {
    const userData = {
        ...data,
        createdAt: Timestamp.now(),
        // Save both casing if we want to be safe, or just new? Let's go with just new standard.
    };

    if (customUid) {
        const docRef = doc(db, "users", customUid);
        await setDoc(docRef, userData);
        return customUid;
    } else {
        const docRef = await addDoc(collection(db, "users"), userData);
        return docRef.id;
    }
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, data);
}

export async function deleteUser(id: string): Promise<void> {
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
}

// Real-time listener for users
export function subscribeToUsers(
    callback: (users: User[]) => void,
    onError?: (error: { code: string; message: string }) => void
): () => void {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
            const users = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fullName: doc.data().full_name || doc.data().fullName,
                photoUrl: doc.data().photo_url || doc.data().photoUrl,
                createdAt: doc.data().created_at || doc.data().createdAt,
            })) as User[];
            callback(users);
        },
        (error) => {
            if (error.code === "permission-denied") return;
            console.error("Firestore subscription error:", error);
            onError?.({ code: error.code, message: error.message });
        }
    );
    return unsubscribe;
}

// ============ CLIENTS ============

export async function getClients(): Promise<Client[]> {
    const querySnapshot = await getDocs(collection(db, "companies"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        contactName: doc.data().contact_name || doc.data().contactName,
    })) as Client[];
}

export const getClientsList = getClients;

export function subscribeToClients(callback: (clients: Client[]) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, "companies"), (snapshot) => {
        const clients = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            contactName: doc.data().contact_name || doc.data().contactName,
        })) as Client[];
        callback(clients);
    }, (error) => {
        if (error.code === "permission-denied") return;
        console.error("Error subscribing to clients:", error);
    });
    return unsubscribe;
}

export function subscribeToClient(
    id: string,
    callback: (client: Client | null) => void
): () => void {
    const docRef = doc(db, "companies", id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ 
                id: doc.id, 
                ...doc.data(),
                contactName: doc.data().contact_name || doc.data().contactName,
            } as Client);
        } else {
            callback(null);
        }
    }, (error) => {
        if (error.code === "permission-denied") return;
        console.error("Error subscribing to client:", error);
    });
    return unsubscribe;
}

export async function createClient(data: CreateClientDTO): Promise<string> {
    try {
        const { lat, lng, ...rest } = data;
        const docRef = await addDoc(collection(db, "companies"), {
            ...rest,
            location: (lat !== undefined && lng !== undefined) ? new GeoPoint(lat, lng) : null,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating company:", error);
        throw error;
    }
}

// ============ DASHBOARD STATS ============

export async function updateClient(id: string, data: UpdateClientDTO): Promise<void> {
    try {
        const { lat, lng, ...rest } = data;
        const updateData: Record<string, unknown> = { ...rest };

        if (lat !== undefined && lng !== undefined) {
            updateData.location = new GeoPoint(lat, lng);
        }

        const docRef = doc(db, "companies", id);
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating company:", error);
        throw error;
    }
}

export async function deleteClient(id: string): Promise<void> {
    try {
        const docRef = doc(db, "companies", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting company:", error);
        throw error;
    }
}

export async function getDashboardStats() {
    const [usersSnap, clientsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "companies")),
    ]);

    const users = usersSnap.docs.map((d) => d.data());
    const technicians = users.filter((u) => u.role === "TECNICO" || u.role === "TECHNICIAN");

    return {
        techniciansTotal: technicians.length,
        techniciansActive: technicians.length,
        clientsTotal: clientsSnap.size,
        usersTotal: usersSnap.size,
    };
}

// ============ EQUIPMENT ============

export async function createEquipment(clientId: string, data: CreateEquipmentDTO): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "companies", clientId, "equipments"), {
            ...data,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating equipment:", error);
        throw error;
    }
}

export async function updateEquipment(clientId: string, equipmentId: string, data: UpdateEquipmentDTO): Promise<void> {
    try {
        const docRef = doc(db, "companies", clientId, "equipments", equipmentId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating equipment:", error);
        throw error;
    }
}

export async function deleteEquipment(clientId: string, equipmentId: string): Promise<void> {
    try {
        const docRef = doc(db, "companies", clientId, "equipments", equipmentId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting equipment:", error);
        throw error;
    }
}

export function subscribeToEquipment(
    clientId: string,
    callback: (equipment: Equipment[]) => void
): () => void {
    // Note: Older documents used 'created_at', new use 'createdAt'. 
    // Query might need adjustment if sorting is strict, or we accept potential mix.
    // Ideally we add a created_at field to new docs too or just sort client side if mixed.
    // For now, let's keep desc sort but be aware of key name.
    const q = query(
        collection(db, "companies", clientId, "equipments"),
        orderBy("createdAt", "desc") 
        // Warning: This ignores 'created_at' docs if index doesn't exist for both or mix. 
        // For standard maintenance, we might want to drop the orderBy here or normalize data.
    );
    const unsubscribe = onSnapshot(collection(db, "companies", clientId, "equipments"), (snapshot) => {
         // Manual sort for safety with mixed keys
        const equipment = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                clientId,
                ...data,
                // Map legacy
                name: data.name || data.nombre,
                model: data.model || data.modelo,
                serialNumber: data.serialNumber || data.serie,
                status: data.status || data.estado,
                lastMaintenance: data.lastMaintenance instanceof Timestamp
                    ? data.lastMaintenance.toDate()
                    : data.lastMaintenance || 
                      (data.ultimo_mantenimiento instanceof Timestamp ? data.ultimo_mantenimiento.toDate() : data.ultimo_mantenimiento),
                createdAt: data.createdAt || data.created_at,
            };
        }) as Equipment[];
        
        // Sort by creation desc
        equipment.sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt as Date;
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt as Date;
            if(!dateA) return 1;
            if(!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });

        callback(equipment);
    }, (error) => {
        if (error.code === "permission-denied") return;
        console.error("Error subscribing to equipment:", error);
    });
    return unsubscribe;
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

// ============ ACTIVITY TEMPLATES ============

export function subscribeToTemplates(
    callback: (templates: Template[]) => void,
    onError?: (error: { code: string; message: string }) => void
): () => void {
    const q = query(collection(db, "protocols"), orderBy("category", "asc"));
    const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
            const templates = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().created_at instanceof Timestamp 
                    ? doc.data().created_at.toDate() 
                    : doc.data().createdAt instanceof Timestamp
                        ? doc.data().createdAt.toDate()
                        : doc.data().created_at || doc.data().createdAt,
                updatedAt: doc.data().updated_at instanceof Timestamp 
                    ? doc.data().updated_at.toDate() 
                    : doc.data().updatedAt instanceof Timestamp
                        ? doc.data().updatedAt.toDate()
                        : doc.data().updated_at || doc.data().updatedAt,
            })) as Template[];
            callback(templates);
        },
        (error) => {
            if (error.code === "permission-denied") return;
            console.error("Firestore subscription error:", error);
            onError?.({ code: error.code, message: error.message });
        }
    );
    return unsubscribe;
}

export async function createTemplate(data: CreateTemplateDTO): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "protocols"), {
            ...data,
            active: data.active ?? true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
}

export async function updateTemplate(id: string, data: UpdateTemplateDTO): Promise<void> {
    try {
        const docRef = doc(db, "protocols", id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
}

export async function deleteTemplate(id: string): Promise<void> {
    try {
        const docRef = doc(db, "protocols", id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
    }
}

