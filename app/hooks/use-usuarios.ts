import { useState, useEffect } from "react";
import { subscribeToUsuarios, type Usuario } from "~/lib/firestore";

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToUsuarios(
            (data) => {
                setUsuarios(data);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore error:", err);
                setLoading(false); // Stop loading even on error
                if (err.code === "permission-denied") {
                    setError("Permisos insuficientes. Necesitas iniciar sesión.");
                } else {
                    setError("Error al cargar usuarios: " + err.message);
                }
            }
        );
        return () => unsubscribe();
    }, []);

    return { usuarios, loading, error };
}
