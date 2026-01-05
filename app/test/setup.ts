import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Firebase for tests
vi.mock("~/lib/firebase", () => ({
    db: {},
    auth: {},
    storage: {},
    app: {},
    firebaseConfig: {},
    googleMapsApiKey: "",
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

