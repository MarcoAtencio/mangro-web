import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUsers } from "./use-users";

// Mock the firestore module
vi.mock("~/lib/firestore", () => ({
    subscribeToUsers: vi.fn(),
}));

import { subscribeToUsers } from "~/lib/firestore";

const mockUsers = [
    { id: "1", fullName: "User A", email: "a@test.com", role: "TECHNICIAN", phone: "123", photoUrl: "", createdAt: new Date() } as any,
    { id: "2", fullName: "User B", email: "b@test.com", role: "ADMIN", phone: "456", photoUrl: "", createdAt: new Date() } as any,
    { id: "3", fullName: "User C", email: "c@test.com", role: "SUPERVISOR", phone: "789", photoUrl: "", createdAt: new Date() } as any,
];

describe("useUsers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should start with loading state", () => {
        vi.mocked(subscribeToUsers).mockImplementation(() => vi.fn());

        const { result } = renderHook(() => useUsers());

        expect(result.current.loading).toBe(true);
        expect(result.current.users).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it("should update users when subscription fires", async () => {
        vi.mocked(subscribeToUsers).mockImplementation((callback) => {
            callback(mockUsers);
            return vi.fn();
        });

        const { result } = renderHook(() => useUsers());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.users).toEqual(mockUsers);
        expect(result.current.error).toBeNull();
    });

    it("should handle permission-denied error", async () => {
        vi.mocked(subscribeToUsers).mockImplementation((callback, onError) => {
            if (onError) {
                onError({ code: "permission-denied", message: "Not allowed" });
            }
            return vi.fn();
        });

        const { result } = renderHook(() => useUsers());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Insufficient permissions. You need to log in.");
        expect(result.current.users).toEqual([]);
    });

    it("should handle generic error", async () => {
        vi.mocked(subscribeToUsers).mockImplementation((callback, onError) => {
            if (onError) {
                onError({ code: "unknown", message: "Something went wrong" });
            }
            return vi.fn();
        });

        const { result } = renderHook(() => useUsers());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Error loading users: Something went wrong");
    });

    it("should cleanup subscription on unmount", () => {
        const unsubscribeMock = vi.fn();
        vi.mocked(subscribeToUsers).mockImplementation(() => unsubscribeMock);

        const { unmount } = renderHook(() => useUsers());

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("should clear error when data loads successfully after error", async () => {
        let errorCallback: ((err: { code: string; message: string }) => void) | undefined;
        let dataCallback: ((users: typeof mockUsers) => void) | undefined;

        vi.mocked(subscribeToUsers).mockImplementation((callback, onError) => {
            dataCallback = callback;
            errorCallback = onError;
            return vi.fn();
        });

        const { result } = renderHook(() => useUsers());

        // Simulate error
        if (errorCallback) {
            errorCallback({ code: "unavailable", message: "Service unavailable" });
        }

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        // Simulate successful data load
        if (dataCallback) {
            dataCallback(mockUsers);
        }

        await waitFor(() => {
            expect(result.current.error).toBeNull();
            expect(result.current.users).toEqual(mockUsers);
        });
    });
});
