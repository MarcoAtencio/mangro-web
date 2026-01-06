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
    ClipboardList,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { useUserDisplay } from "~/hooks/use-user-display";

const navigation = [
    { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/clients", icon: Building2 },
    { name: "Servicios", href: "/services", icon: Calendar },
    { name: "Usuarios", href: "/technicians", icon: Users },
    { name: "Reportes", href: "/reports", icon: FileText },
    { name: "Protocolos", href: "/templates", icon: ClipboardList },
    { name: "Configuración", href: "/settings", icon: Settings },
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
            {/* Floating Toggle Button */}
            {onToggle && (
                <Button
                    onClick={onToggle}
                    className="absolute -right-3 top-[20px] z-50 h-7 w-7 rounded-full border border-slate-200 bg-white p-0 shadow-md hover:bg-slate-50 hover:text-slate-900 text-slate-500 transition-all duration-200 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                    variant="ghost"
                    size="icon"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                </Button>
            )}

            {/* Logo Section */}
            <div className={cn(
                "flex items-center justify-center border-b border-slate-100 transition-all duration-300",
                collapsed ? "h-16 px-2" : "h-16 px-4"
            )}>
                <img
                    src="/logo-mangro.png"
                    alt="MANGRO"
                    className={cn(
                        "object-contain",
                        collapsed ? "h-5 w-5" : "h-6 w-auto"
                    )}
                    fetchPriority="high"
                />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-6 px-3 overflow-y-auto">
                <div className="space-y-1">
                    {mainNavigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            aria-label={item.name}
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                    collapsed && "justify-center px-2"
                                )
                            }
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 flex-shrink-0 transition-all duration-300",
                                "group-hover:scale-110 group-active:scale-95"
                            )} />
                            {!collapsed && <span>{item.name}</span>}
                            {/* Active Indicator Dot */}
                            <div className={cn(
                                "absolute left-0 w-1 h-4 bg-white rounded-full transition-all duration-300 opacity-0 -translate-x-1",
                                "group-[.active]:opacity-100 group-[.active]:translate-x-0"
                            )} />
                        </NavLink>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-6 px-3">
                    <div className="h-px bg-slate-100" />
                </div>

                {/* Secondary Navigation */}
                <div className="space-y-1">
                    {!collapsed && (
                        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                            SISTEMA
                        </span>
                    )}
                    <div className="mt-2 space-y-1">
                        {secondaryNavigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                aria-label={item.name}
                                className={({ isActive }) =>
                                    cn(
                                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                        collapsed && "justify-center px-2"
                                    )
                                }
                                title={collapsed ? item.name : undefined}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-all duration-300",
                                    "group-hover:scale-110 group-active:scale-95"
                                )} />
                                {!collapsed && <span>{item.name}</span>}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* User Profile Section */}
            <div className={cn("border-t border-slate-100 transition-all duration-300", collapsed ? "p-3" : "p-4")}>
                {collapsed ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="h-10 w-full p-0 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center"
                                title="Perfil y opciones"
                            >
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt={displayName}
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                                        <span className="text-xs font-bold text-white">{initials}</span>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="w-56" align="end" sideOffset={10}>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50 border border-slate-100 shadow-sm">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={`Foto de perfil de ${displayName}`}
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                                <span className="text-xs font-bold text-white">{initials}</span>
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
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
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
                className="xl:hidden -ml-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white transition-transform duration-300 xl:hidden shadow-2xl flex flex-col",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                    <img
                        src="/logo-mangro.png"
                        alt="MANGRO"
                        className="h-6 w-auto object-contain"
                        fetchPriority="high"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        aria-label="Close menu"
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
                                        "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="my-6 px-3">
                        <div className="h-px bg-slate-100" />
                    </div>

                    {/* Secondary Navigation */}
                    <div className="space-y-1">
                        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                            SISTEMA
                        </span>
                        <div className="mt-2 space-y-1">
                            {secondaryNavigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300",
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )
                                    }
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                    <span>{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-3 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={`Foto de perfil de ${displayName}`}
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                width={36}
                                height={36}
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white shadow-sm">
                                <span className="text-xs font-bold text-white">{initials}</span>
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
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-all"
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
