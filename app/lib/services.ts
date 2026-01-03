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

// Interface matching the provided screenshot "tasks" collection
export interface Task {
    id: string;
    companyId: string; // Added to link back to Client
    address: string;
    clientName: string;
    contactName: string; // User who requested or contact person? Assuming contact person at client.
    equipmentSummary: string;
    priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO"; // Mapping standard statuses to capitalize as in screenshot? Screenshot shows "Completado", "Urgente"
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
    const q = query(collection(db, "tasks"), orderBy("createAt", "desc"));

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
                    status: data.status?.toUpperCase() || "PENDIENTE",
                } as Task;
            });
            onUpdate(tasks);
        },
        onError
    );
};

export const subscribeToClientServices = (
    clientId: string,
    onUpdate: (tasks: Task[]) => void,
    onError: (error: Error) => void
) => {
    const q = query(
        collection(db, "tasks"),
        where("companyId", "==", clientId),
        orderBy("createAt", "desc")
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
                    status: data.status?.toUpperCase() || "PENDIENTE",
                } as Task;
            });
            onUpdate(tasks);
        },
        onError
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
    description: string;
    equipment: string;
}

export const createService = async (taskData: CreateTaskDTO) => {
    try {
        const docRef = await addDoc(collection(db, "tasks"), {
            companyId: taskData.companyId || "", // Link to company/client
            address: taskData.clientAddress,
            clientName: taskData.clientName,
            contactName: taskData.contactName || "",
            scheduledTime: `${taskData.startTime} - ${taskData.endTime}`,
            technicianId: taskData.technicianId,
            description: taskData.description || "",
            equipmentSummary: taskData.equipment || "",
            priority: taskData.priority || "MEDIA",
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
        const docRef = doc(db, "tasks", taskId);
        await updateDoc(docRef, {
            status: status,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};
