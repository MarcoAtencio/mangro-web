import { useState, useEffect } from "react";
import { subscribeToServices, type Task } from "~/lib/services";

export function useServices() {
    const [services, setServices] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToServices(
            (data) => {
                const normalizedData = data.map((task) => ({
                    ...task,
                    // Ensure status is normalized to what the UI expects if needed
                    status: (task.status?.toUpperCase() || "PENDIENTE") as Task["status"],
                }));
                setServices(normalizedData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Services subscription error:", err);
                setLoading(false);
                setError("Error loading services: " + (err.message || "Unknown error"));
            }
        );
        return () => unsubscribe();
    }, []);

    return { services, loading, error };
}
