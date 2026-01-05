import { useState, useEffect } from "react";
import { subscribeToClients, type Client } from "~/lib/firestore";

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToClients((data) => {
            setClients(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { clients, loading, error };
}
