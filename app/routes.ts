import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

/**
 * Application route configuration.
 * Uses file-based routing with lazy loading for performance.
 * 
 * Routes are organized as:
 * - Public routes (login)
 * - API routes (no layout, action-only)
 * - Protected routes (require authentication via protected-layout)
 */
export default [
    // Public routes
    route("login", "routes/login.tsx"),

    // API Routes (no layout, action-only)
    route("api/admin/set-password", "routes/api.admin.set-password.tsx"),

    // Protected routes (require authentication)
    layout("components/layout/protected-layout.tsx", [
        index("routes/home.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("clients", "routes/clients.tsx"),
        route("clients/:clientId", "routes/clients.$clientId.tsx"),
        route("technicians", "routes/technicians.tsx"),
        route("settings", "routes/settings.tsx"),
        route("services", "routes/services.tsx"),
        route("templates", "routes/templates.tsx"),
        route("reports", "routes/reports.tsx"),
    ]),
] satisfies RouteConfig;

