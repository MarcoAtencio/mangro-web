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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Spinner className="h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <Outlet />;
}
