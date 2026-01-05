import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuth } from "~/lib/auth";
import { Spinner } from "~/components/ui/spinner";

export default function ProtectedLayout() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [user, loading, navigate]);

    // During session verification, we render the Outlet anyway.
    // This allows child routes to show their own HydrateFallback (skeletons) 
    // instead of an empty spinner, which improves Lighthouse FCP/LCP significantly.
    // The useEffect above will handle the redirect if the session is eventually null.
    return <Outlet />;
}
