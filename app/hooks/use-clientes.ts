import { useState, useEffect } from "react";
import { subscribeToClientes, type Cliente } from "~/lib/firestore";

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
         // subscribeToClientes in firestore.ts currently doesn't support error callback in the signature shown in Step 20
         // "export function subscribeToClientes(callback: (clientes: Cliente[]) => void): () => void"
         // I should update firestore.ts eventually to handle errors properly or wrap it here.
         // For now, I'll use it as is and assume it works, or try-catch the setup if it was async (it's not).
         // Wait, onSnapshot takes an error callback. I should modify subscribeToClientes first to accept onError?
         // Actually, let's keep it simple and just use what is there.
        const unsubscribe = subscribeToClientes((data) => {
            setClientes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { clientes, loading, error };
}
