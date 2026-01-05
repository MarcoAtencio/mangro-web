import { describe, it, expect } from "vitest";
import {
    mapFirebaseError,
    isFirebaseError,
    getErrorMessage,
} from "./error-utils";

describe("error-utils", () => {
    describe("mapFirebaseError", () => {
        it("should map auth errors correctly", () => {
            expect(mapFirebaseError("auth/user-not-found")).toBe("Usuario no encontrado");
            expect(mapFirebaseError("auth/wrong-password")).toBe("Contraseña incorrecta");
            expect(mapFirebaseError("auth/invalid-email")).toBe("Email inválido");
        });

        it("should return default auth message for unknown auth errors", () => {
            expect(mapFirebaseError("auth/unknown-error")).toBe("Error de autenticación");
        });

        it("should map firestore errors correctly", () => {
            expect(mapFirebaseError("permission-denied")).toBe("No tiene permisos para esta operación");
            expect(mapFirebaseError("not-found")).toBe("Documento no encontrado");
            expect(mapFirebaseError("unavailable")).toBe("Servicio no disponible. Intente más tarde");
        });

        it("should return default message for unknown errors", () => {
            expect(mapFirebaseError("random-error")).toBe("Ha ocurrido un error. Intente nuevamente");
        });
    });

    describe("isFirebaseError", () => {
        it("should return true for Firebase-like errors", () => {
            const firebaseError = { code: "auth/user-not-found", message: "User not found" };
            expect(isFirebaseError(firebaseError)).toBe(true);
        });

        it("should return false for non-Firebase errors", () => {
            expect(isFirebaseError(new Error("Regular error"))).toBe(false);
            expect(isFirebaseError(null)).toBe(false);
            expect(isFirebaseError(undefined)).toBe(false);
            expect(isFirebaseError("string error")).toBe(false);
            expect(isFirebaseError({ message: "no code" })).toBe(false);
        });

        it("should return false for objects with non-string code", () => {
            expect(isFirebaseError({ code: 123 })).toBe(false);
        });
    });

    describe("getErrorMessage", () => {
        it("should handle Firebase errors", () => {
            const firebaseError = { code: "auth/user-not-found", message: "User not found" };
            expect(getErrorMessage(firebaseError)).toBe("Usuario no encontrado");
        });

        it("should handle standard Error objects", () => {
            const error = new Error("Standard error message");
            expect(getErrorMessage(error)).toBe("Standard error message");
        });

        it("should handle string errors", () => {
            expect(getErrorMessage("String error")).toBe("String error");
        });

        it("should return fallback for unknown error types", () => {
            expect(getErrorMessage(null)).toBe("Ha ocurrido un error inesperado");
            expect(getErrorMessage(undefined)).toBe("Ha ocurrido un error inesperado");
            expect(getErrorMessage(123)).toBe("Ha ocurrido un error inesperado");
        });

        it("should use custom fallback message", () => {
            expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
        });
    });
});
