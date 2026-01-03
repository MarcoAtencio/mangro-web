import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {
    Building2,
    ChevronDown,
    ChevronRight,
    Plus,
    Search,
    Settings,
    Wrench,
    MapPin,
    Phone,
    Mail,
} from "lucide-react";
import { subscribeToClientes, type Cliente } from "~/lib/firestore";
// Removed mockClientes and local interface

// Helper to provide empty equipments if not present in DB, as schema might differ
// or we might need to fetch equipments separately. For now assuming equipments are embedded or we just empty list.
// The current `companies` schema doesn't seem to have `equipos` based on previous screenshot.
// But the UI requires `equipos`.
// I will verify if I need to fetch equipments or just default to empty.
// Based on the user request "traiga la data de firestore", primarily fetching companies.
// I will initialize `equipos` as empty array if missing.



function getEstadoBadge(estado: string) {
    switch (estado) {
        case "activo":
            return <Badge variant="success">Activo</Badge>;
        case "mantenimiento":
            return <Badge variant="warning">En Mantenimiento</Badge>;
        case "inactivo":
            return <Badge variant="secondary">Inactivo</Badge>;
        default:
            return <Badge variant="outline">{estado}</Badge>;
    }
}

interface ClienteRowProps {
    cliente: Cliente;
}

// function ClienteRow({ cliente }: { cliente: Cliente & { equipos?: any[] } }) { // Ensuring equipos is optional or handled
// Actually, let's keep it simple. If 'equipos' is missing, pass empty array.
// But the Cliente type from firestore.ts might NOT have 'equipos' defined if I didn't add it.
// I'll update the component to handle missing equipos.

function ClienteRow({ cliente }: { cliente: Cliente }) {
    const [expanded, setExpanded] = useState(false);
    // Safe access to equipos
    const equipos = (cliente as any).equipos || [];

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setExpanded(!expanded)}
            >
                <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{cliente.name}</p>
                            <p className="text-sm text-muted-foreground">RUC: {cliente.ruc || "N/A"}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {cliente.address || "Sin dirección"}
                    </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                    {cliente.contact_name || "Sin contacto"}
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="gap-1">
                        <Wrench className="h-3 w-3" />
                        {equipos.length} equipos
                    </Badge>
                </TableCell>
                <TableCell>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>

            {/* Equipos expandibles */}
            {expanded && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <div className="p-4 pl-16">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-medium text-sm">Catálogo de Equipos</h4>
                                <Button size="sm" variant="outline" className="gap-1">
                                    <Plus className="h-3 w-3" />
                                    Agregar Equipo
                                </Button>
                            </div>

                            {equipos.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {equipos.map((equipo: any) => (
                                        <Card key={equipo.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
                                                            <Wrench className="h-4 w-4 text-accent" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{equipo.nombre}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {equipo.modelo}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getEstadoBadge(equipo.estado)}
                                                </div>
                                                <div className="space-y-1 text-xs text-muted-foreground mt-3">
                                                    <p>
                                                        <span className="font-medium">Serie:</span> {equipo.serie}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Último Mant.:</span>{" "}
                                                        {equipo.ultimoMantenimiento}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic py-4">No hay equipos registrados para este cliente.</p>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function NuevoClienteDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del cliente para registrarlo en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Razón Social</Label>
                            <Input id="nombre" placeholder="Empresa S.A.C." required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ruc">RUC</Label>
                                <Input id="ruc" placeholder="20123456789" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input id="telefono" placeholder="+51 1 234 5678" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" placeholder="Av. Principal 123, Lima" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="contacto">Contacto Principal</Label>
                                <Input id="contacto" placeholder="Nombre del contacto" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="email@empresa.com" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            {loading ? "Guardando..." : "Registrar Cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ClientesPage() {
    const [search, setSearch] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToClientes((data) => {
            setClientes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredClientes = clientes.filter(
        (cliente) =>
            cliente.name.toLowerCase().includes(search.toLowerCase()) ||
            (cliente.ruc && cliente.ruc.includes(search))
    );

    return (
        <AdminLayout title="Gestión de Clientes">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar clientes..." className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm w-full" />
                    </div>
                    <NuevoClienteDialog />
                </div>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{clientes.length}</p>
                                <p className="text-sm text-muted-foreground">Clientes Totales</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Wrench className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {clientes.reduce((acc, c) => acc + ((c as any).equipos?.length || 0), 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Equipos Registrados</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {clientes.reduce(
                                        (acc, c) =>
                                            acc + ((c as any).equipos?.filter((e: any) => e.estado === "mantenimiento").length || 0),
                                        0
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">En Mantenimiento</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clients Table */}
                <Card className="border-slate-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Lista de Clientes</CardTitle>
                        <CardDescription>
                            Haga clic en un cliente para ver su catálogo de equipos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 pb-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                                        <TableHead className="hidden md:table-cell text-center">Equipos</TableHead>
                                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <Spinner className="h-8 w-8 mx-auto" />
                                                <p className="text-sm text-muted-foreground mt-2">Cargando clientes...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredClientes.map((cliente) => (
                                                <ClienteRow key={cliente.id} cliente={cliente} />
                                            ))}
                                            {filteredClientes.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <p className="text-muted-foreground">
                                                            No se encontraron clientes
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
