import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useServices } from "./use-services";
import type { Task } from "~/lib/services";

// Mock the services module
vi.mock("~/lib/services", () => ({
    subscribeToServices: vi.fn(),
}));

import { subscribeToServices } from "~/lib/services";

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: "1",
    companyId: "company-1",
    address: "Test Address",
    clientName: "Test Client",
    contactName: "Test Contact",
    equipment: [],
    serviceType: "PREVENTIVO" as const,
    priority: "MEDIA" as const,
    status: "PENDIENTE" as const,
    scheduledTime: "10:00",
    technicianId: "tech-1",
    description: "Test Service",
    createAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const mockServices: Task[] = [
    createMockTask({ id: "1", status: "PENDIENTE" }),
    createMockTask({ id: "2", status: "EN_PROGRESO" }),
];

describe("useServices", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should start with loading state", () => {
        vi.mocked(subscribeToServices).mockImplementation(() => vi.fn());
        
        const { result } = renderHook(() => useServices());

        expect(result.current.loading).toBe(true);
        expect(result.current.services).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it("should update services when subscription fires", async () => {
        vi.mocked(subscribeToServices).mockImplementation((callback) => {
            callback(mockServices);
            return vi.fn();
        });

        const { result } = renderHook(() => useServices());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.services).toHaveLength(2);
        expect(result.current.error).toBeNull();
    });

    it("should normalize status to uppercase", async () => {
        const lowercaseServices: Task[] = [
            createMockTask({ id: "1", status: "pendiente" as Task["status"] }),
        ];

        vi.mocked(subscribeToServices).mockImplementation((callback) => {
            callback(lowercaseServices);
            return vi.fn();
        });

        const { result } = renderHook(() => useServices());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.services[0].status).toBe("PENDIENTE");
    });

    it("should handle errors from subscription", async () => {
        vi.mocked(subscribeToServices).mockImplementation((_, onError) => {
            if (onError) {
                onError({ message: "Connection failed", code: "unavailable" } as Error & { code: string });
            }
            return vi.fn();
        });

        const { result } = renderHook(() => useServices());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toContain("Error loading services");
    });

    it("should cleanup subscription on unmount", () => {
        const unsubscribeMock = vi.fn();
        vi.mocked(subscribeToServices).mockImplementation(() => unsubscribeMock);

        const { unmount } = renderHook(() => useServices());

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
