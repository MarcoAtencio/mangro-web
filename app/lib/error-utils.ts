/**
 * Firebase error code to user-friendly message mapping (Spanish).
 * Provides consistent error messages across the application.
 */

/**
 * Firebase Auth error codes.
 */
const FIREBASE_AUTH_ERRORS: Record<string, string> = {
    // Authentication errors
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Credenciales inválidas",
    "auth/invalid-email": "Email inválido",
    "auth/user-disabled": "Usuario deshabilitado",
    "auth/email-already-in-use": "El email ya está registrado",
    "auth/operation-not-allowed": "Operación no permitida",
    "auth/weak-password": "La contraseña es muy débil",
    "auth/too-many-requests": "Demasiados intentos. Intente más tarde",
    "auth/network-request-failed": "Error de conexión. Verifique su internet",
    "auth/requires-recent-login": "Debe iniciar sesión nuevamente para esta operación",
    "auth/popup-closed-by-user": "Se cerró la ventana de autenticación",
    "auth/unauthorized-domain": "Dominio no autorizado",
    "auth/expired-action-code": "El código de acción ha expirado",
    "auth/invalid-action-code": "Código de acción inválido",
};

/**
 * Firestore error codes.
 */
const FIREBASE_FIRESTORE_ERRORS: Record<string, string> = {
    "permission-denied": "No tiene permisos para esta operación",
    "not-found": "Documento no encontrado",
    "already-exists": "El documento ya existe",
    "resource-exhausted": "Límite de recursos alcanzado",
    "failed-precondition": "Operación no válida en el estado actual",
    "aborted": "Operación cancelada",
    "out-of-range": "Valor fuera de rango",
    "unimplemented": "Operación no implementada",
    "internal": "Error interno del servidor",
    "unavailable": "Servicio no disponible. Intente más tarde",
    "data-loss": "Pérdida de datos irrecuperable",
    "unauthenticated": "No autenticado. Inicie sesión",
    "cancelled": "Operación cancelada",
    "unknown": "Error desconocido",
    "invalid-argument": "Argumento inválido",
    "deadline-exceeded": "Tiempo de espera agotado",
};

/**
 * Map a Firebase error code to a user-friendly message in Spanish.
 * 
 * @param code - Firebase error code (e.g., "auth/user-not-found")
 * @returns User-friendly error message in Spanish
 * 
 * @example
 * try {
 *     await signIn(email, password);
 * } catch (error) {
 *     const message = mapFirebaseError(error.code);
 *     setError(message);
 * }
 */
export function mapFirebaseError(code: string): string {
    // Check auth errors first
    if (code.startsWith("auth/")) {
        return FIREBASE_AUTH_ERRORS[code] || "Error de autenticación";
    }
    
    // Check firestore errors
    if (FIREBASE_FIRESTORE_ERRORS[code]) {
        return FIREBASE_FIRESTORE_ERRORS[code];
    }
    
    // Default fallback
    return "Ha ocurrido un error. Intente nuevamente";
}

/**
 * Interface for Firebase-like errors.
 */
export interface FirebaseErrorLike {
    code: string;
    message: string;
}

/**
 * Type guard to check if an error is a Firebase error.
 * 
 * @param error - Unknown error object
 * @returns True if the error has Firebase error structure
 * 
 * @example
 * try {
 *     await someFirebaseOperation();
 * } catch (error) {
 *     if (isFirebaseError(error)) {
 *         console.log("Firebase code:", error.code);
 *     }
 * }
 */
export function isFirebaseError(error: unknown): error is FirebaseErrorLike {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as FirebaseErrorLike).code === "string"
    );
}

/**
 * Extract and map error message from any error type.
 * Handles Firebase errors, standard errors, and unknown error types.
 * 
 * @param error - Any error type
 * @param fallbackMessage - Optional fallback message
 * @returns User-friendly error message
 * 
 * @example
 * try {
 *     await riskyOperation();
 * } catch (error) {
 *     setError(getErrorMessage(error, "No se pudo completar la operación"));
 * }
 */
export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
    if (isFirebaseError(error)) {
        return mapFirebaseError(error.code);
    }
    
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === "string") {
        return error;
    }
    
    return fallbackMessage || "Ha ocurrido un error inesperado";
}
