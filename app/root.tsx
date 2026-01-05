import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css"; // Tu CSS principal con Tailwind
import { AuthProvider } from "~/lib/auth";
import { auth } from "~/lib/firebase";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ✅ 1. LOADER CRÍTICO: Espera a que Firebase verifique la sesión en IndexedDB
// Esto evita que la app muestre "No autenticado" por un milisegundo.
export async function clientLoader() {
    await auth.authStateReady();
    return null;
}

export const links: Route.LinksFunction = () => [
    // ✅ 2. PRELOAD DE FUENTE LOCAL (Clave para LCP verde)
    // Asegúrate de que el archivo existe en public/fonts/inter.woff2
    { 
        rel: "preload", 
        href: "/fonts/inter.woff2", 
        as: "font", 
        type: "font/woff2", 
        crossOrigin: "anonymous" 
    },

    // ✅ 3. Preload de imagen crítica (Tu logo)
    // Esto ayuda a que el navegador priorice la descarga de la imagen del sidebar
    { 
        rel: "preload", 
        as: "image", 
        href: "/logo-mangro.jpg", 
        fetchPriority: "high" as const 
    },
    
    // Conexiones anticipadas a servicios externos que SÍ usas
    { rel: "preconnect", href: "https://www.googletagmanager.com" },
    { rel: "preconnect", href: "https://firestore.googleapis.com" },

    // NOTA: Se eliminaron los links a fonts.googleapis.com y fonts.gstatic.com
    // porque ahora sirves la fuente localmente.
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0069B4" />
                <title>MANGRO Admin</title>
                <link rel="icon" href="/favicon.jpg" />
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

export default function App() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

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