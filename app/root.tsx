import { useState, useEffect } from "react";
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "~/lib/auth";
import { auth } from "~/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ============================================================================
// LOADER NO BLOQUEANTE
// ============================================================================
// Retorna inmediatamente sin esperar a Firebase.
// Esto permite un First Contentful Paint (FCP) y LCP instantáneos.
// El estado de autenticación se maneja de forma optimista en el cliente.
export function clientLoader() {
    return null;
}

// ============================================================================
// HYDRATE FALLBACK - Skeleton ligero para renderizado inmediato
// ============================================================================
/**
 * Skeleton minimalista que se muestra mientras Firebase verifica el auth.
 * Diseñado para ser extremadamente ligero y no afectar el LCP.
 */
export function HydrateFallback() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Logo placeholder - usa el mismo tamaño que el logo real */}
                <div className="w-32 h-12 bg-slate-200 rounded-lg animate-pulse" />
                {/* Loading indicator */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// LINKS - Preload de recursos críticos
// ============================================================================
export const links: Route.LinksFunction = () => [
    // Preload de fuente local (crítico para LCP)
    { 
        rel: "preload", 
        href: "/fonts/inter.woff2", 
        as: "font", 
        type: "font/woff2", 
        crossOrigin: "anonymous" 
    },

    // Preload de imagen crítica (logo)
    { 
        rel: "preload", 
        as: "image", 
        href: "/logo-mangro.jpg", 
        fetchPriority: "high" as const 
    },
    
    // Conexiones anticipadas a Firebase (crítico para reducir latencia de auth)
    { rel: "preconnect", href: "https://firestore.googleapis.com" },
    { rel: "preconnect", href: "https://identitytoolkit.googleapis.com" },
    { rel: "preconnect", href: "https://securetoken.googleapis.com" },
    { rel: "dns-prefetch", href: "https://apis.google.com" },
];

// ============================================================================
// LAYOUT - Estructura base del documento HTML
// ============================================================================
export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0069B4" />
                <title>MANGRO Admin</title>
                <link rel="icon" href="/favicon.jpg" />
                {/* Critical CSS inline para FCP instantáneo */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter.woff2') format('woff2')}
                    *{box-sizing:border-box;margin:0;padding:0}
                    html{font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
                    body{background:#f8fafc;color:#0f172a;min-height:100vh}
                    .min-h-screen{min-height:100vh}
                    .bg-slate-50{background:#f8fafc}
                    .flex{display:flex}
                    .items-center{align-items:center}
                    .justify-center{justify-content:center}
                    .flex-col{flex-direction:column}
                    .gap-4{gap:1rem}
                    .animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite}
                    .animate-bounce{animation:bounce 1s infinite}
                    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
                    @keyframes bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
                    .w-32{width:8rem}.h-12{height:3rem}.w-2{width:.5rem}.h-2{height:.5rem}
                    .bg-slate-200{background:#e2e8f0}.bg-primary{background:#0069b4}
                    .rounded-lg{border-radius:.5rem}.rounded-full{border-radius:9999px}
                `}} />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}

// ============================================================================
// APP - Componente principal con Optimistic UI para Auth
// ============================================================================
/**
 * Implementa "Renderizado Inmediato" (Non-blocking UI):
 * - Muestra un skeleton ligero mientras Firebase verifica el estado de auth
 * - Una vez listo, renderiza la aplicación completa con AuthProvider
 */
export default function App() {
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Suscribirse a cambios de estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, () => {
            // Cuando Firebase responde (usuario logueado o null), marcamos como listo
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // Mientras Firebase verifica el auth, mostrar skeleton
    if (!isAuthReady) {
        return <HydrateFallback />;
    }

    // Una vez listo, renderizar la app completa
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}