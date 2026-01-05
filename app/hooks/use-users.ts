import { useState, useEffect } from "react";
import { subscribeToUsers, type User } from "~/lib/firestore";

/**
 * Hook for subscribing to real-time user data from Firestore.
 * Automatically manages subscription lifecycle and handles errors.
 * 
 * @returns Object containing:
 * - `users`: Array of all users
 * - `loading`: Boolean indicating if initial data is loading
 * - `error`: Error message if subscription failed, null otherwise
 * 
 * @example
 * ```tsx
 * function UsersList() {
 *     const { users, loading, error } = useUsers();
 *     
 *     if (loading) return <Spinner />;
 *     if (error) return <Error message={error} />;
 *     
 *     return users.map(user => <UserCard key={user.id} user={user} />);
 * }
 * ```
 */
export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToUsers(
            (data) => {
                setUsers(data);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore error:", err);
                setLoading(false); // Stop loading even on error
                if (err.code === "permission-denied") {
                    setError("Insufficient permissions. You need to log in.");
                } else {
                    setError("Error loading users: " + err.message);
                }
            }
        );
        return () => unsubscribe();
    }, []);

    return { users, loading, error };
}
