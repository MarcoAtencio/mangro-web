import { useState } from "react";
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
        <AdminLayout title="Gestión de Técnicos">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
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

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar técnicos..."
                            className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm w-full"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                    <NuevoTecnicoDialog onSuccess={() => {}} />
                </div>

                {/* Users Table */}
                <Card className="border-slate-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Lista de Usuarios</CardTitle>
                        <CardDescription>
                            Gestiona los técnicos y usuarios del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 pb-0">
                        <div className="overflow-x-auto rounded-md border border-slate-200">
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
                                            className="hover:bg-slate-50/50 transition-colors"
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

                        {/* Pagination Controls */}
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredUsuarios.length}
                            itemsPerPage={10}
                            onPageChange={setPage}
                            itemName="resultados"
                        />
                    </CardContent>
                </Card>
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
