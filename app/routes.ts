import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // Public routes
    route("login", "routes/login.tsx"),

    // Protected routes (require authentication)
    layout("components/layout/protected-layout.tsx", [
        index("routes/home.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("clientes", "routes/clientes.tsx"),
        route("clientes/:clienteId", "routes/clientes.$clienteId.tsx"),
        route("tecnicos", "routes/tecnicos.tsx"),
        route("configuracion", "routes/configuracion.tsx"),
        route("servicios", "routes/servicios.tsx"),
    ]),
] satisfies RouteConfig;
