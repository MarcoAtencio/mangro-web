import { useState, useEffect } from "react";
import { subscribeToServices, type Task } from "~/lib/services";
import { subscribeToUsuarios, subscribeToClientes, type Usuario } from "~/lib/firestore";

export function useDashboardStats() {
    const [stats, setStats] = useState({
        sc_informesHoy: 0,
        sc_informesPendientes: 0,
        sc_tecnicosActivos: 0,
        sc_tecnicosTotal: 0,
        sc_clientesTotal: 0,
        sc_equiposTotal: 0, // Note: We might not have a global equipment subscription yet, so this might need adjustment or be 0 for now.
    });
    
    // We will also return recent reports for the table
    const [recentServices, setRecentServices] = useState<Task[]>([]);
    const [technicians, setTechnicians] = useState<Usuario[]>([]); // New state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeServices: () => void;
        let unsubscribeUsers: () => void;
        let unsubscribeClients: () => void;

        // Initialize subscriptions
        try {
            // 1. Services Stats
            unsubscribeServices = subscribeToServices((tasks) => {
                const today = new Date();
                const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                const endOfDay = new Date(today.setHours(23, 59, 59, 999));

                const todayServices = tasks.filter(t => {
                    if (!t.date) return false;
                    const tDate = new Date(t.date);
                    return tDate >= startOfDay && tDate <= endOfDay;
                });

                const pendingServices = tasks.filter(t => t.status === "PENDIENTE" || t.status === "EN_PROGRESO"); // Considering "En Revision" as similar or just specific status

                setRecentServices(tasks.slice(0, 5)); // Top 5 recent

                setStats(prev => ({
                    ...prev,
                    sc_informesHoy: todayServices.length,
                    sc_informesPendientes: pendingServices.length,
                }));
                // Data has arrived, so we can stop loading.
                // Note: This might cause flicker if users/clients take longer, but usually services is the critical path for the dashboard table.
                setLoading(false);
            }, (error) => {
                console.error("Error fetching services", error);
                setLoading(false);
            });

            // 2. Users Stats
            unsubscribeUsers = subscribeToUsuarios((users) => {
                const tech = users.filter(u => u.role === "TECNICO");
                setTechnicians(tech); // Set technicians
                setStats(prev => ({
                    ...prev,
                    sc_tecnicosTotal: tech.length,
                    sc_tecnicosActivos: tech.length, // Assuming all are active for now as we don't have 'online' status
                }));
            });

            // 3. Clients Stats
            unsubscribeClients = subscribeToClientes((clients) => {
                setStats(prev => ({
                    ...prev,
                    sc_clientesTotal: clients.length,
                    // Note: Calculating total equipment would require fetching subcollections for ALL clients which provides heavy read cost. 
                    // For now we will keep teams as 0 or remove it if not efficient. 
                    // Alternatively, we could keep a running counter on the client document or a global counter.
                    // Let's leave it as 0 or maybe mock it safely for now until we change DB structure.
                }));
            });
            
        } catch (error) {
            console.error("Error setting up subscriptions", error);
            // set state asynchronously to avoid linter error
            setTimeout(() => setLoading(false), 0);
        }

        return () => {
            if (unsubscribeServices) unsubscribeServices();
            if (unsubscribeUsers) unsubscribeUsers();
            if (unsubscribeClients) unsubscribeClients();
        };
    }, []);

    return { stats, recentServices, technicians, loading };
}
