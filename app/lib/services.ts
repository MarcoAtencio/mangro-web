import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    where,
    Timestamp,
} from "firebase/firestore";

// Equipment reference - minimal data for display, ID for lookups
export interface EquipmentRef {
    id: string;
    name: string;
    checklistTemplateId?: string; // Legacy/Original reference
    templateId?: string; // Specific template ID for this service instance
    templateName?: string; // Specific template Name for this service instance
}

// Service type
export type ServiceType = "PREVENTIVO" | "CORRECTIVO";

// Interface matching the provided screenshot "tasks" collection
export interface Task {
    id: string;
    companyId: string; // Added to link back to Client
    address: string;
    clientName: string;
    contactName: string; // User who requested or contact person? Assuming contact person at client.
    equipment: EquipmentRef[]; // Array of equipment references
    equipmentSummary?: string; // Legacy field for backwards compatibility
    serviceType: ServiceType; // Preventivo, Correctivo, Emergencia
    priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";
    scheduledTime: string; // "09:00 - 10:30"
    technicianId: string;
    description: string;

    // Timestamps
    createAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    startedAt?: Timestamp | Date;
    completedAt?: Timestamp | Date;

    // Helper for local usage (optional, but good for filtering unique date)
    date?: Date;
}

export const subscribeToServices = (
    onUpdate: (tasks: Task[]) => void,
    onError: (error: Error) => void
) => {
    // Querying 'tasks' collection
    const q = query(collection(db, "services"), orderBy("createAt", "desc"));

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Ensure Timestamps are converted
                    createAt: data.createAt?.toDate
                        ? data.createAt.toDate()
                        : new Date(data.createAt),
                    updatedAt: data.updatedAt?.toDate
                        ? data.updatedAt.toDate()
                        : new Date(data.updatedAt),
                    date: data.date?.toDate
                        ? data.date.toDate()
                        : data.date
                          ? new Date(data.date)
                          : undefined,
                    status: data.status?.toUpperCase().replace(/\s+/g, '_') || "PENDIENTE",
                } as Task;
            });
            onUpdate(tasks);
        },
        (error) => {
            if ((error as any).code === "permission-denied") return;
            onError(error);
        }
    );
};

export const subscribeToClientServices = (
    clientId: string,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: Error) => void
) => {
    const q = query(
        collection(db, "services"),
        where("companyId", "==", clientId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createAt: data.createAt?.toDate
                        ? data.createAt.toDate()
                        : new Date(data.createAt),
                    updatedAt: data.updatedAt?.toDate
                        ? data.updatedAt.toDate()
                        : new Date(data.updatedAt),
                    date: data.date?.toDate
                        ? data.date.toDate()
                        : data.date
                          ? new Date(data.date)
                          : undefined,
                    status: data.status?.toUpperCase().replace(/\s+/g, '_') || "PENDIENTE",
                } as Task;
            });
            // Sort client-side
            tasks.sort((a, b) => new Date(b.createAt as Date).getTime() - new Date(a.createAt as Date).getTime());
            onUpdate(tasks);
        },
        (error) => {
            if ((error as any).code === "permission-denied") return;
            onError(error);
        }
    );
};

export interface CreateTaskDTO {
    companyId: string;
    clientName: string;
    clientAddress: string;
    contactName: string;
    technicianId: string;
    date: Date;
    startTime: string;
    endTime: string;
    priority: Task["priority"];
    serviceType: ServiceType;
    description: string;
    equipment: EquipmentRef[]; // Array of equipment references
}

export const createService = async (taskData: CreateTaskDTO) => {
    try {
        const docRef = await addDoc(collection(db, "services"), {
            companyId: taskData.companyId || "", // Link to company/client
            address: taskData.clientAddress,
            clientName: taskData.clientName,
            contactName: taskData.contactName || "",
            scheduledTime: `${taskData.startTime} - ${taskData.endTime}`,
            technicianId: taskData.technicianId,
            description: taskData.description || "",
            equipment: taskData.equipment || [], // Store as array of objects
            priority: taskData.priority || "MEDIA",
            serviceType: taskData.serviceType || "PREVENTIVO",
            status: "PENDIENTE",

            createAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            date: Timestamp.fromDate(taskData.date),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const updateServiceStatus = async (taskId: string, status: string) => {
    try {
        const docRef = doc(db, "services", taskId);
        await updateDoc(docRef, {
            status: status,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};
