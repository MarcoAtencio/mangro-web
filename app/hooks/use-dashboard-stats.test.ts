import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardStats } from "./use-dashboard-stats";

// Mock the modules
vi.mock("~/lib/services", () => ({
    subscribeToServices: vi.fn(),
}));

vi.mock("~/lib/firestore", () => ({
    subscribeToUsers: vi.fn(),
    subscribeToClients: vi.fn(),
}));

import { subscribeToServices } from "~/lib/services";
import { subscribeToUsers, subscribeToClients } from "~/lib/firestore";

const mockServices = [
    { id: "1", status: "PENDIENTE", date: new Date().toISOString(), companyId: "c1", address: "", clientName: "Test", contactName: "", description: "", priority: "MEDIA", technicianId: "", equipment: [], equipmentSummary: "" } as any,
    { id: "2", status: "EN_PROGRESO", date: new Date().toISOString(), companyId: "c1", address: "", clientName: "Test", contactName: "", description: "", priority: "MEDIA", technicianId: "", equipment: [], equipmentSummary: "" } as any,
    { id: "3", status: "COMPLETADO", date: new Date().toISOString(), companyId: "c1", address: "", clientName: "Test", contactName: "", description: "", priority: "MEDIA", technicianId: "", equipment: [], equipmentSummary: "" } as any,
];

const mockUsers = [
    { id: "1", fullName: "Tech 1", role: "TECHNICIAN", email: "t1@test.com", phone: "", photoUrl: "", createdAt: new Date() } as any,
    { id: "2", fullName: "Tech 2", role: "TECHNICIAN", email: "t2@test.com", phone: "", photoUrl: "", createdAt: new Date() } as any,
    { id: "3", fullName: "Admin", role: "ADMIN", email: "a@test.com", phone: "", photoUrl: "", createdAt: new Date() } as any,
];

const mockClients = [
    { id: "1", name: "Client A", address: "Addr A" } as any,
    { id: "2", name: "Client B", address: "Addr B" } as any,
];

describe("useDashboardStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should start with loading state", () => {
        vi.mocked(subscribeToServices).mockImplementation(() => vi.fn());
        vi.mocked(subscribeToUsers).mockImplementation(() => vi.fn());
        vi.mocked(subscribeToClients).mockImplementation(() => vi.fn());

        const { result } = renderHook(() => useDashboardStats());

        expect(result.current.loading).toBe(true);
        expect(result.current.stats.reportsToday).toBe(0);
        expect(result.current.stats.reportsPending).toBe(0);
    });

    it("should update stats when services subscription fires", async () => {
        vi.mocked(subscribeToServices).mockImplementation((callback) => {
            callback(mockServices);
            return vi.fn();
        });
        vi.mocked(subscribeToUsers).mockImplementation(() => vi.fn());
        vi.mocked(subscribeToClients).mockImplementation(() => vi.fn());

        const { result } = renderHook(() => useDashboardStats());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Should have pending and in-progress count
        expect(result.current.stats.reportsPending).toBe(2);
        expect(result.current.recentServices).toHaveLength(3);
    });

    it("should update technicians count from users subscription", async () => {
        vi.mocked(subscribeToServices).mockImplementation((callback) => {
            callback([]);
            return vi.fn();
        });
        vi.mocked(subscribeToUsers).mockImplementation((callback) => {
            callback(mockUsers);
            return vi.fn();
        });
        vi.mocked(subscribeToClients).mockImplementation(() => vi.fn());

        const { result } = renderHook(() => useDashboardStats());

        await waitFor(() => {
            expect(result.current.technicians).toHaveLength(2);
        });

        expect(result.current.stats.techniciansTotal).toBe(2);
    });

    it("should update clients count from clients subscription", async () => {
        vi.mocked(subscribeToServices).mockImplementation((callback) => {
            callback([]);
            return vi.fn();
        });
        vi.mocked(subscribeToUsers).mockImplementation(() => vi.fn());
        vi.mocked(subscribeToClients).mockImplementation((callback) => {
            callback(mockClients);
            return vi.fn();
        });

        const { result } = renderHook(() => useDashboardStats());

        await waitFor(() => {
            expect(result.current.stats.clientsTotal).toBe(2);
        });
    });

    it("should cleanup all subscriptions on unmount", () => {
        const unsubServices = vi.fn();
        const unsubUsers = vi.fn();
        const unsubClients = vi.fn();

        vi.mocked(subscribeToServices).mockImplementation(() => unsubServices);
        vi.mocked(subscribeToUsers).mockImplementation(() => unsubUsers);
        vi.mocked(subscribeToClients).mockImplementation(() => unsubClients);

        const { unmount } = renderHook(() => useDashboardStats());

        unmount();

        expect(unsubServices).toHaveBeenCalled();
        expect(unsubUsers).toHaveBeenCalled();
        expect(unsubClients).toHaveBeenCalled();
    });
});
