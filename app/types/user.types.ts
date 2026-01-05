/**
 * User type representing a system user (admin, technician, or supervisor).
 */
export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    photoUrl: string;
    role: UserRole;
    fcmToken?: string;
    createdAt: Date | FirestoreTimestamp;
}

/**
 * User role options.
 */
export type UserRole = "ADMIN" | "TECHNICIAN" | "SUPERVISOR" | "TECNICO";

/**
 * Firestore Timestamp type (for compatibility).
 */
export interface FirestoreTimestamp {
    toDate(): Date;
    seconds: number;
    nanoseconds: number;
}
