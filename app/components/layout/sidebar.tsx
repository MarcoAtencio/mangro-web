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

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Técnicos", href: "/tecnicos", icon: Users },
    { name: "Servicios", href: "/servicios", icon: Calendar },
    { name: "Clientes", href: "/clientes", icon: Building2 },
    { name: "Informes", href: "/informes", icon: FileText },
    { name: "Configuración", href: "/configuracion", icon: Settings },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const { user, userProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    // Get user display info
    const displayName = userProfile?.full_name || user?.email?.split("@")[0] || "Usuario";
    const displayEmail = user?.email || "";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const photoUrl = userProfile?.photo_url;

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-muted">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-mangro.jpg"
                            alt="MANGRO"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-primary">MANGRO S.A.C.</span>
                            <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <img
                        src="/logo-mangro.jpg"
                        alt="MANGRO"
                        className="h-8 w-8 rounded-lg object-cover mx-auto"
                    />
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className={cn(
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted",
                        collapsed && "hidden"
                    )}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                collapsed && "justify-center px-2"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-sidebar-muted">
                <div
                    className={cn(
                        "flex items-center gap-3",
                        collapsed && "justify-center"
                    )}
                >
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={displayName}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                            <span className="text-xs font-medium text-white">{initials}</span>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate">{displayName}</span>
                            <span className="text-xs text-sidebar-foreground/60 truncate">
                                {displayEmail}
                            </span>
                        </div>
                    )}
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 shrink-0"
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
                        className="w-full mt-2 text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10"
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
    const { user, userProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    const displayName = userProfile?.full_name || user?.email?.split("@")[0] || "Usuario";
    const displayEmail = user?.email || "";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const photoUrl = userProfile?.photo_url;

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
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 md:hidden",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-muted">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo-mangro.jpg"
                            alt="MANGRO"
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-primary">MANGRO S.A.C.</span>
                            <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-sidebar-muted">
                    <div className="flex items-center gap-3">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={displayName}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                                <span className="text-xs font-medium text-white">{initials}</span>
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate">{displayName}</span>
                            <span className="text-xs text-sidebar-foreground/60 truncate">
                                {displayEmail}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 shrink-0"
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
