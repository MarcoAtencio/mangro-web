import { db } from "./firebase";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

// Interface matching the provided screenshot "tasks" collection
export interface Task {
    id: string;
    address: string;
    clientName: string;
    contactName: string; // User who requested or contact person? Assuming contact person at client.
    equipmentSummary: string;
    priority: "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
    status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO"; // Mapping standard statuses to capitalize as in screenshot? Screenshot shows "Completado", "Urgente"
    scheduledTime: string; // "09:00 - 10:30"
    technicianId: string;

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
    onError: (error: any) => void
) => {
    // Querying 'tasks' collection
    const q = query(
        collection(db, "tasks"),
        orderBy("createAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure Timestamps are converted
                createAt: data.createAt?.toDate ? data.createAt.toDate() : new Date(data.createAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
                // Parse date from createAt or if we decide to add a specific date field later.
                // For now, let's assume the task date is primarily driven by created/scheduled.
                // NOTE: The previous UI had a date picker. We might want to store 'scheduledDate' if needed.
                // But following the screenshot strictly, there is no 'scheduledDate'.
                // We will rely on 'createAt' or 'scheduledTime' context for now, 
                // OR add 'date' field implicitly if the user allows deviations. 
                // Given the screenshot is "THE data", I will respect it but maybe add 'date' 
                // as a hidden field if allowed, otherwise I'll stick to the list.
                // Actually, for a scheduler, you NEED a date. The screenshot might just default to "today" 
                // or have a field scrolled out of view? I'll assume 'date' is useful to keep for our UI 
                // even if not in the minimal screenshot, OR I will store it as a Timestamp in `scheduledDate` if I can.
                // Let's stick to the screenshot's `tasks` collection name.
            } as Task;
        });
        onUpdate(tasks);
    }, onError);
};

export const createService = async (taskData: any) => {
    // taskData will come from the form. We need to map it to the screenshot structure.
    try {
        const docRef = await addDoc(collection(db, "tasks"), {
            address: taskData.clientAddress,
            clientName: taskData.clientName,
            contactName: taskData.contactName || "", // New field
            equipmentSummary: taskData.equipment,
            priority: capitalizeFirst(taskData.priority), // "Urgente"
            status: "Pendiente", // Title case as in screenshot "Completado"
            scheduledTime: `${taskData.startTime} - ${taskData.endTime}`,
            technicianId: taskData.technicianId,

            createAt: Timestamp.now(),
            updatedAt: Timestamp.now(),

            // We might want to save the raw date too if we want to query by day later
            // adding 'scheduledDate' or just 'date' as a helper if schema permits.
            // Screenshot didn't explicitly forbid other fields.
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
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};

function capitalizeFirst(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
