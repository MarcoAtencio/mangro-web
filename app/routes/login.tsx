import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "~/lib/auth";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const { signIn, loading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setIsSubmitting(true);

        try {
            await signIn(email, password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            // Error is handled in auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Branded Background Patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(0,86,150,0.08)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative w-full max-w-md">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary/40 to-primary/40 rounded-2xl blur-xl opacity-40 animate-pulse" />

                <Card className="relative border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2 pt-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                <img
                                    src="/logo-mangro.jpg"
                                    alt="MANGRO"
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                            Panel de Administración
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Bienvenido, ingresa tus credenciales
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error message */}
                            {displayError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{displayError}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@mangro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-secondary focus:ring-secondary/20 transition-all duration-200 h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        Contraseña
                                    </Label>
                                    <a href="#" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-secondary focus:ring-secondary/20 pr-10 transition-all duration-200 h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-medium h-11 mt-4 shadow-lg shadow-primary/25 transition-all duration-200 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Iniciar Sesión
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-center text-xs text-slate-400">
                                MANGRO S.A.C. © 2026<br />Sistema de Gestión de Informes Técnicos
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
