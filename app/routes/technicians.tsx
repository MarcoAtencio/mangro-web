import type { MetaFunction } from "react-router";
import { useState, lazy, Suspense } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Usuarios y Personal | MANGRO Admin" },
        { name: "description", content: "Administre el personal técnico, roles y permisos del sistema MANGRO S.A.C." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    Users,
    Search,
    Shield,
    UserCircle,
    MoreHorizontal,
    Pencil,
    Mail,
    Phone,
    Filter,
    ArrowUpDown,
    Plus,
} from "lucide-react";

import { useUsers } from "~/hooks/use-users";
import { usePagination } from "~/hooks/use-pagination";
import { type User } from "~/lib/firestore";

import { StatsCard } from "~/components/ui/stats-card";
import { RoleBadge } from "~/components/users/role-badge";
import { PaginationControls } from "~/components/ui/pagination-controls";
// import { NewUserDialog } from "~/components/users/new-user-dialog";
const NewUserDialog = lazy(() => import("~/components/users/new-user-dialog").then(m => ({ default: m.NewUserDialog })));
import { EditUserDialog } from "~/components/users/edit-user-dialog";
import { UsersSkeleton } from "~/components/users/users-skeleton";

export default function TechniciansPage() {
    const { users, loading, error } = useUsers();
    
    // Local state
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Derived state
    // Note: Assuming "TECHNICIAN" is the standard role now. If legacy "TECNICO" exists, filtered logic might need adjustment or data migration.
    // For now, we filter by both if needed or stick to new convention. 
    // In firestore.ts we enforced "TECHNICIAN".
    const technicians = users.filter((u) => u.role === "TECHNICIAN" || u.role === "TECNICO" as any);
    const admins = users.filter((u) => u.role === "ADMIN");
    const supervisors = users.filter((u) => u.role === "SUPERVISOR");

    // Filtering
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.role?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = filterRole === "all" || user.role === filterRole || (filterRole === "TECHNICIAN" && user.role === "TECNICO" as any);

        return matchesSearch && matchesRole;
    });

    // Pagination
    const {
        currentPage,
        totalPages,
        setPage,
        nextPage,
        prevPage,
        startIndex,
        endIndex
    } = usePagination({ 
        totalItems: filteredUsers.length,
        itemsPerPage: 10,
        initialPage: 1 
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleFilterRoleChange = (role: string) => {
        // Toggle logic
        const newRole = filterRole === role && role !== "all" ? "all" : role;
        setFilterRole(newRole);
        setPage(1);
    };

    const [showNewUser, setShowNewUser] = useState(false);
    
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    if (loading) {
        return (
            <AdminLayout title="Gestión de Usuarios">
                <UsersSkeleton />
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Gestión de Usuarios">
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md">
                        <CardContent className="pt-6 text-center">
                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Acceso Restringido</h3>
                            <p className="text-muted-foreground text-sm mb-4">{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Reintentar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title="Gestión de Usuarios"
            subtitle="Administre el personal técnico y roles del sistema"
            headerActions={
                <Button 
                    variant="default" 
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 text-white" 
                    onClick={() => setShowNewUser(true)}
                    aria-label="Registrar nuevo usuario"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nuevo Usuario</span>
                </Button>
            }
        >
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
                    <StatsCard
                        title="Total Usuarios"
                        value={users.length}
                        icon={Users}
                        active={filterRole === "all"}
                        onClick={() => handleFilterRoleChange("all")}
                    />
                    <StatsCard
                        title="Técnicos"
                        value={technicians.length}
                        icon={Users}
                        variant="green"
                        active={filterRole === "TECHNICIAN"}
                        onClick={() => handleFilterRoleChange("TECHNICIAN")}
                    />
                    <StatsCard
                        title="Supervisores"
                        value={supervisors.length}
                        icon={Shield}
                        variant="amber"
                        active={filterRole === "SUPERVISOR"}
                        onClick={() => handleFilterRoleChange("SUPERVISOR")}
                    />
                    <StatsCard
                        title="Administradores"
                        value={admins.length}
                        icon={Shield}
                        variant="blue"
                        active={filterRole === "ADMIN"}
                        onClick={() => handleFilterRoleChange("ADMIN")}
                    />
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    {/* Search - Left side */}
                    <div className="relative w-full sm:w-64 lg:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="search-users"
                            aria-label="Buscar usuarios por nombre, email o rol"
                            placeholder="Buscar usuarios por nombre, email o rol..."
                            className="pl-9 h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm w-full"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Filters - Right side */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9" aria-label="Abrir filtros">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm" className="h-9" aria-label="Cambiar orden">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Ordenar
                        </Button>
                    </div>
                </div>

                {/* Users Table - With gray background section */}
                <div className="flex flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 md:py-5 lg:py-6 pb-6 lg:pb-8 bg-slate-100/70 flex-1 -mb-4 md:-mb-6 lg:-mb-8 border-t border-slate-200">
                    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[80px]">Personal</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Email
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Teléfono
                                    </TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="hover:bg-slate-50 transition-all duration-300 hover:shadow-sm"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {user.photoUrl ? (
                                                    <img
                                                        src={user.photoUrl}
                                                        alt={`Foto de perfil de ${user.fullName}`}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        width={40}
                                                        height={40}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserCircle className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {user.fullName || "Sin nombre"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {user.phone || (
                                                    <span className="text-muted-foreground italic">
                                                        Sin teléfono
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell><RoleBadge role={user.role} /></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild aria-label={`Acciones para ${user.fullName}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Acciones
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setEditingUser(user)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />{" "}
                                                        Editar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                No se encontraron usuarios
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination inside gray section */}
                    {filteredUsers.length > 0 && (
                        <div className="mt-6">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsers.length}
                                itemsPerPage={10}
                                onPageChange={setPage}
                                itemName="usuarios"
                            />
                        </div>
                    )}
                </div>
            </div>
            {showNewUser && (
                <Suspense fallback={null}>
                    <NewUserDialog onSuccess={() => setShowNewUser(false)} />
                </Suspense>
            )}
            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                />
            )}
        </AdminLayout>
    );
}
