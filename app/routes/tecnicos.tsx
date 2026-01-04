import type { MetaFunction } from "react-router";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Técnicos | MANGRO Admin" },
        { name: "description", content: "Administra el personal técnico y roles del sistema." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
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
} from "lucide-react";

import { useUsuarios } from "~/hooks/use-usuarios";
import { usePagination } from "~/hooks/use-pagination";
import { type Usuario } from "~/lib/firestore";

import { StatsCard } from "~/components/ui/stats-card";
import { RoleBadge } from "~/components/users/role-badge";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { NuevoTecnicoDialog } from "~/components/tecnicos/nuevo-tecnico-dialog";
import { EditarTecnicoDialog } from "~/components/tecnicos/editar-tecnico-dialog";

export default function TecnicosPage() {
    const { usuarios, loading, error } = useUsuarios();
    
    // Local state
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    // Derived state
    const tecnicos = usuarios.filter((u) => u.role === "TECNICO");
    const admins = usuarios.filter((u) => u.role === "ADMIN");
    const supervisores = usuarios.filter((u) => u.role === "SUPERVISOR");

    // Filtering
    const filteredUsuarios = usuarios.filter((usuario) => {
        const matchesSearch =
            usuario.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            usuario.email?.toLowerCase().includes(search.toLowerCase()) ||
            usuario.role?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = filterRole === "all" || usuario.role === filterRole;

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
        totalItems: filteredUsuarios.length,
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

    const paginatedUsuarios = filteredUsuarios.slice(startIndex, endIndex);

    if (loading) {
        return (
            <AdminLayout title="Gestión de Técnicos">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <Spinner className="h-8 w-8 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Cargando usuarios...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Gestión de Técnicos">
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
            subtitle="Administra el personal técnico y roles del sistema"
            headerActions={<NuevoTecnicoDialog onSuccess={() => {}} />}
            breadcrumb={[{ label: "MANGRO" }, { label: "Usuarios" }]}
        >
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
                    <StatsCard
                        title="Total Usuarios"
                        value={usuarios.length}
                        icon={Users}
                        active={filterRole === "all"}
                        onClick={() => handleFilterRoleChange("all")}
                    />
                    <StatsCard
                        title="Técnicos"
                        value={tecnicos.length}
                        icon={Users}
                        variant="green"
                        active={filterRole === "TECNICO"}
                        onClick={() => handleFilterRoleChange("TECNICO")}
                    />
                    <StatsCard
                        title="Supervisores"
                        value={supervisores.length}
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
                            placeholder="Buscar usuarios por nombre, email o rol..."
                            className="pl-9 h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm w-full"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Filters - Right side */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm" className="h-9">
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
                                {paginatedUsuarios.map((usuario) => (
                                    <TableRow
                                        key={usuario.id}
                                        className="hover:bg-slate-50 transition-all duration-300 hover:shadow-sm"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {usuario.photo_url ? (
                                                    <img
                                                        src={usuario.photo_url}
                                                        alt={usuario.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserCircle className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {usuario.full_name || "Sin nombre"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {usuario.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {usuario.phone || (
                                                    <span className="text-muted-foreground/50 italic">
                                                        Sin teléfono
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell><RoleBadge role={usuario.role} /></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
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
                                                        onClick={() => setEditingUser(usuario)}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />{" "}
                                                        Editar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedUsuarios.length === 0 && (
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
                    {filteredUsuarios.length > 0 && (
                        <div className="mt-6">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsuarios.length}
                                itemsPerPage={10}
                                onPageChange={setPage}
                                itemName="usuarios"
                            />
                        </div>
                    )}
                </div>
            </div>
            {editingUser && (
                <EditarTecnicoDialog
                    usuario={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                />
            )}
        </AdminLayout>
    );
}
