import { useState, useEffect } from "react";
import { subscribeToServices, type Task } from "~/lib/services";
import { subscribeToUsers, subscribeToClients, type User } from "~/lib/firestore";

/**
 * Hook for aggregating real-time dashboard statistics from Firestore.
 * Subscribes to services, users, and clients collections simultaneously.
 * 
 * @returns Object containing:
 * - `stats`: Aggregated statistics (reports today/pending, technicians, clients)
 * - `recentServices`: Array of the 5 most recent services
 * - `technicians`: Array of users with TECHNICIAN role
 * - `loading`: Boolean indicating if initial data is loading
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *     const { stats, recentServices, loading } = useDashboardStats();
 *     
 *     if (loading) return <Spinner />;
 *     
 *     return (
 *         <>
 *             <StatsCard value={stats.reportsPending} />
 *             <RecentServicesTable services={recentServices} />
 *         </>
 *     );
 * }
 * ```
 */
export function useDashboardStats() {
    const [stats, setStats] = useState({
        reportsToday: 0,
        reportsPending: 0,
        techniciansActive: 0,
        techniciansTotal: 0,
        clientsTotal: 0,
        equipmentTotal: 0, 
    });
    
    // We will also return recent reports for the table
    const [recentServices, setRecentServices] = useState<Task[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]); // New state
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

                const pendingServices = tasks.filter(t => t.status === "PENDIENTE" || t.status === "EN_PROGRESO"); 

                setRecentServices(tasks.slice(0, 5)); // Top 5 recent

                setStats(prev => ({
                    ...prev,
                    reportsToday: todayServices.length,
                    reportsPending: pendingServices.length,
                }));
                setLoading(false);
            }, (error) => {
                console.error("Error fetching services", error);
                setLoading(false);
            });

            // 2. Users Stats
            unsubscribeUsers = subscribeToUsers((users) => {
                const tech = users.filter(u => u.role === "TECHNICIAN"); 
                setTechnicians(tech); 
                setStats(prev => ({
                    ...prev,
                    techniciansTotal: tech.length,
                    techniciansActive: tech.length,
                }));
            });

            // 3. Clients Stats
            unsubscribeClients = subscribeToClients((clients) => {
                setStats(prev => ({
                    ...prev,
                    clientsTotal: clients.length,
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
