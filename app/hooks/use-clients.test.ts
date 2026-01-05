import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useClients } from "./use-clients";

// Mock the firestore module
vi.mock("~/lib/firestore", () => ({
    subscribeToClients: vi.fn(),
}));

import { subscribeToClients } from "~/lib/firestore";

const mockClients = [
    { id: "1", name: "Client A", address: "Address A" },
    { id: "2", name: "Client B", address: "Address B" },
];

describe("useClients", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should start with loading state", () => {
        vi.mocked(subscribeToClients).mockImplementation(() => vi.fn());
        
        const { result } = renderHook(() => useClients());

        expect(result.current.loading).toBe(true);
        expect(result.current.clients).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it("should update clients when subscription fires", async () => {
        vi.mocked(subscribeToClients).mockImplementation((callback) => {
            callback(mockClients);
            return vi.fn();
        });

        const { result } = renderHook(() => useClients());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.clients).toEqual(mockClients);
    });

    it("should cleanup subscription on unmount", () => {
        const unsubscribeMock = vi.fn();
        vi.mocked(subscribeToClients).mockImplementation(() => unsubscribeMock);

        const { unmount } = renderHook(() => useClients());

        unmount();

        expect(unsubscribeMock).toHaveBeenCalled();
    });
});
