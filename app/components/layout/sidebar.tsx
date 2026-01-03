import { NavLink, useNavigate } from "react-router";
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Calendar,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { useUserDisplay } from "~/hooks/use-user-display";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/clientes", icon: Building2 },
    { name: "Servicios", href: "/servicios", icon: Calendar },
    { name: "Usuarios", href: "/tecnicos", icon: Users },
    { name: "Informes", href: "/informes", icon: FileText },
    { name: "Configuración", href: "/configuracion", icon: Settings },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { displayName, displayEmail, initials, photoUrl, roleName } = useUserDisplay();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    const mainNavigation = navigation.slice(0, 4); // Dashboard, Clientes, Servicios, Usuarios
    const secondaryNavigation = navigation.slice(4); // Informes, Configuración

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className={cn(
                "flex items-center h-16 border-b border-slate-100",
                collapsed ? "justify-center px-2" : "justify-between px-4"
            )}>
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-mangro.jpg"
                            alt="MANGRO"
                            className="h-8 w-8 object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#0069B4]">MANGRO S.A.C.</span>
                            <span className="text-[11px] text-slate-400">Admin Panel</span>
                        </div>
                    </div>
                ) : (
                    <img
                        src="/logo-mangro.jpg"
                        alt="MANGRO"
                        className="h-8 w-8 object-contain"
                    />
                )}
                {!collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-6 px-3 overflow-y-auto">
                <div className="space-y-1">
                    {mainNavigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-[#0069B4] text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                    collapsed && "justify-center px-2 border-l-0 ml-0"
                                )
                            }
                        >
                            <item.icon className={cn(
                                "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                            )} />
                            {!collapsed && <span>{item.name}</span>}
                        </NavLink>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Secondary Navigation */}
                <div className="space-y-1">
                    {!collapsed && (
                        <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Sistema
                        </span>
                    )}
                    <div className="mt-2 space-y-1">
                        {secondaryNavigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#0069B4] text-white shadow-md"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                        collapsed && "justify-center px-2 border-l-0 ml-0"
                                    )
                                }
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                                )} />
                                {!collapsed && <span>{item.name}</span>}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* User Profile Section */}
            <div className="p-3 border-t border-slate-100">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer",
                    collapsed && "justify-center p-2"
                )}>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={displayName}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                            <span className="text-xs font-bold text-white">{initials}</span>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-slate-800">{displayName}</span>
                            <span className="text-[11px] text-slate-500 truncate">
                                {roleName || displayEmail}
                            </span>
                        </div>
                    )}
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="w-full mt-2 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Cerrar sesión"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </aside>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { displayName, displayEmail, initials, photoUrl, roleName } = useUserDisplay();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    const mainNavigation = navigation.slice(0, 4);
    const secondaryNavigation = navigation.slice(4);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="md:hidden -ml-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white transition-transform duration-300 md:hidden shadow-2xl",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-mangro.jpg"
                            alt="MANGRO"
                            className="h-8 w-8 object-contain"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#0069B4]">MANGRO S.A.C.</span>
                            <span className="text-[11px] text-slate-400">Admin Panel</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto">
                    <div className="space-y-1">
                        {mainNavigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[#0069B4] text-white shadow-md"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Secondary Navigation */}
                    <div className="space-y-1">
                        <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Sistema
                        </span>
                        <div className="mt-2 space-y-1">
                            {secondaryNavigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-[#0069B4] text-white shadow-md"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        )
                                    }
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                                <span className="text-sm font-bold text-white">{initials}</span>
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-slate-800">{displayName}</span>
                            <span className="text-[11px] text-slate-500 truncate">
                                {roleName || displayEmail}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}
