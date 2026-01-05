import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialogForm } from "./use-dialog-form";

interface TestFormData {
    name: string;
    email: string;
}

const initialData: TestFormData = {
    name: "",
    email: "",
};

describe("useDialogForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should start with correct initial state", () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        expect(result.current.open).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.formData).toEqual(initialData);
    });

    it("should update open state", () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        act(() => {
            result.current.setOpen(true);
        });

        expect(result.current.open).toBe(true);

        act(() => {
            result.current.setOpen(false);
        });

        expect(result.current.open).toBe(false);
    });

    it("should update individual fields with updateField", () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        act(() => {
            result.current.updateField("name", "John Doe");
        });

        expect(result.current.formData.name).toBe("John Doe");
        expect(result.current.formData.email).toBe("");

        act(() => {
            result.current.updateField("email", "john@example.com");
        });

        expect(result.current.formData.email).toBe("john@example.com");
    });

    it("should call onSubmit and close dialog on successful submit", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const onSuccess = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit, onSuccess })
        );

        act(() => {
            result.current.setOpen(true);
            result.current.updateField("name", "Test");
        });

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(onSubmit).toHaveBeenCalledWith({ name: "Test", email: "" });
        expect(onSuccess).toHaveBeenCalled();
        expect(result.current.open).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it("should handle submit error gracefully", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const onSubmit = vi.fn().mockRejectedValue(new Error("Submit failed"));
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        act(() => {
            result.current.setOpen(true);
        });

        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

        await act(async () => {
            await result.current.handleSubmit(mockEvent);
        });

        expect(consoleSpy).toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
        
        consoleSpy.mockRestore();
    });

    it("should reset form data when reset is called", () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        act(() => {
            result.current.updateField("name", "Changed");
            result.current.updateField("email", "changed@test.com");
        });

        expect(result.current.formData.name).toBe("Changed");

        act(() => {
            result.current.reset();
        });

        expect(result.current.formData).toEqual(initialData);
    });

    it("should reset form when dialog is closed", () => {
        const onSubmit = vi.fn();
        const { result } = renderHook(() =>
            useDialogForm({ initialData, onSubmit })
        );

        act(() => {
            result.current.setOpen(true);
            result.current.updateField("name", "Test Name");
        });

        expect(result.current.formData.name).toBe("Test Name");

        act(() => {
            result.current.setOpen(false);
        });

        expect(result.current.formData).toEqual(initialData);
    });
});
