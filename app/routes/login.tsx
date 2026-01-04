import type { MetaFunction } from "react-router";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Iniciar Sesión | MANGRO Admin" },
        { name: "description", content: "Acceso al panel de administración de MANGRO S.A.C." },
    ];
};
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "~/lib/auth";
import { Eye, EyeOff, LogIn, AlertCircle, Mail, Lock } from "lucide-react";

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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0069B40d_0%,transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#00A39B0d_0%,transparent_40%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

            <div className="relative w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500 will-change-transform">
                <Card className="relative border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <CardHeader className="text-center pb-2 pt-8">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 ring-1 ring-slate-50">
                                <img
                                    src="/logo-mangro.jpg"
                                    alt="MANGRO"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-primary tracking-tight">
                            Panel de Administración
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-sm mt-1">
                            Ingresa tus credenciales para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error message */}
                            {displayError && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 border border-red-100">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{displayError}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-slate-700 text-xs font-semibold uppercase tracking-wider"
                                >
                                    Email Corporativo
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@mangro.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-700 text-xs font-semibold uppercase tracking-wider"
                                    >
                                        Contraseña
                                    </Label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-end pt-1">
                                    <a
                                        href="#"
                                        className="text-xs text-primary/80 hover:text-primary font-medium transition-colors hover:underline underline-offset-4"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-11 mt-6 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] rounded-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="mr-2 h-4 w-4" />
                                        Iniciando...
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
                        <div className="mt-8 pt-6 border-t border-slate-100/60 text-center">
                            <p className="text-xs text-slate-400">
                                MANGRO S.A.C. © {new Date().getFullYear()}
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1">
                                Sistema de Gestión de Informes Técnicos
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
