import { useState, useCallback } from "react";

interface UseDialogFormOptions<T> {
    initialData: T;
    onSubmit: (data: T) => Promise<void>;
    onSuccess?: () => void;
}

interface UseDialogFormReturn<T> {
    open: boolean;
    loading: boolean;
    formData: T;
    setOpen: (open: boolean) => void;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    reset: () => void;
}

/**
 * Generic hook for managing dialog form state.
 * Reduces boilerplate in dialog components by handling:
 * - Open/close state
 * - Loading state
 * - Form data management
 * - Submit handling with error catching
 * - Form reset
 */
export function useDialogForm<T extends object>({
    initialData,
    onSubmit,
    onSuccess,
}: UseDialogFormOptions<T>): UseDialogFormReturn<T> {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<T>(initialData);

    const reset = useCallback(() => {
        setFormData(initialData);
        setLoading(false);
    }, [initialData]);

    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);

            try {
                await onSubmit(formData);
                setOpen(false);
                reset();
                onSuccess?.();
            } catch (error) {
                console.error("Form submission error:", error);
                // Could add toast notification here
            } finally {
                setLoading(false);
            }
        },
        [formData, onSubmit, onSuccess, reset]
    );

    const handleSetOpen = useCallback(
        (newOpen: boolean) => {
            setOpen(newOpen);
            if (!newOpen) {
                // Reset form when closing
                reset();
            }
        },
        [reset]
    );

    return {
        open,
        loading,
        formData,
        setOpen: handleSetOpen,
        setFormData,
        updateField,
        handleSubmit,
        reset,
    };
}
