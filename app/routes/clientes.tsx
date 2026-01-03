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
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Settings,
    Wrench,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Pencil,
    Trash2,
} from "lucide-react";
import { subscribeToClientes, type Cliente, createCliente, updateCliente, deleteCliente, createEquipo, updateEquipo, deleteEquipo, subscribeToEquipos, type Equipo } from "~/lib/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AddressPicker } from "~/components/ui/address-picker";
// Removed mockClientes and local interface

// Helper to provide empty equipments if not present in DB, as schema might differ
// or we might need to fetch equipments separately. For now assuming equipments are embedded or we just empty list.
// The current `companies` schema doesn't seem to have `equipos` based on previous screenshot.
// But the UI requires `equipos`.
// I will verify if I need to fetch equipments or just default to empty.
// Based on the user request "traiga la data de firestore", primarily fetching companies.
// I will initialize `equipos` as empty array if missing.



function getEstadoBadge(estado: string) {
    const baseClasses = "min-w-20 justify-center text-center font-medium";

    switch (estado) {
        case "activo":
            return <Badge className={`${baseClasses} bg-green-600 text-white hover:bg-green-700 shadow-sm`}>Activo</Badge>;
        case "mantenimiento":
            return <Badge className={`${baseClasses} bg-amber-500 text-white hover:bg-amber-600 shadow-sm`}>Mantenimiento</Badge>;
        case "inactivo":
            return <Badge variant="secondary" className={`${baseClasses}`}>Inactivo</Badge>;
        default:
            return <Badge variant="outline" className={baseClasses}>{estado}</Badge>;
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
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    // Always subscribe to equipos to show correct count
    useEffect(() => {
        const unsubscribe = subscribeToEquipos(cliente.id, (data) => {
            setEquipos(data);
        });
        return () => unsubscribe();
    }, [cliente.id]);

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
                        <span className={cliente.address ? "" : "italic"}>
                            {cliente.address || "Sin dirección"}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                    <span className={cliente.contact_name ? "text-foreground" : "text-muted-foreground text-sm italic"}>
                        {cliente.contact_name || "Sin contacto"}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant="outline"
                        className="gap-1.5 min-w-20 justify-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 text-primary font-medium"
                    >
                        <Wrench className="h-3 w-3" />
                        {equipos.length} equipos
                    </Badge>
                </TableCell>
                <TableCell>
                    <EditarClienteDialog cliente={cliente} />
                </TableCell>
            </TableRow>

            {/* Equipos expandibles */}
            {expanded && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <div className="p-4 pl-16">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-medium text-sm">Catálogo de Equipos</h4>
                                <NuevoEquipoDialog clienteId={cliente.id} />
                            </div>

                            {equipos.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {equipos.map((equipo) => (
                                        <Card key={equipo.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 relative">
                                                <div className="absolute top-3 right-3">
                                                    <EditarEquipoDialog clienteId={cliente.id} equipo={equipo} />
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3 pr-8">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                            <Wrench className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm line-clamp-1" title={equipo.nombre}>{equipo.nombre}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1" title={equipo.modelo}>
                                                                {equipo.modelo}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-dashed border-slate-100">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Serie</p>
                                                            <p className="text-xs font-medium font-mono">{equipo.serie}</p>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Mantenimiento</p>
                                                            <p className="text-xs font-medium">
                                                                {equipo.ultimo_mantenimiento
                                                                    ? format(new Date(equipo.ultimo_mantenimiento as Date), "dd MMM yyyy", { locale: es })
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-start">
                                                        {getEstadoBadge(equipo.estado)}
                                                    </div>
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

function NuevoEquipoDialog({ clienteId }: { clienteId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        modelo: "",
        serie: "",
        estado: "activo",
        ultimo_mantenimiento: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Append time to ensure it doesn't shift day due to timezone
            const dateValue = new Date(`${formData.ultimo_mantenimiento}T12:00:00`);
            await createEquipo(clienteId, {
                ...formData,
                ultimo_mantenimiento: dateValue,
            });
            setLoading(false);
            setOpen(false);
            setFormData({
                nombre: "",
                modelo: "",
                serie: "",
                estado: "activo",
                ultimo_mantenimiento: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error("Error creating equipment:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Agregar Equipo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Agregar Nuevo Equipo</DialogTitle>
                        <DialogDescription>
                            Registre un nuevo equipo para este cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información del Equipo</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="eq-nombre">Nombre</Label>
                                <Input
                                    id="eq-nombre"
                                    placeholder="Ej: Aire Acondicionado"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-modelo">Modelo</Label>
                                    <Input
                                        id="eq-modelo"
                                        placeholder="Modelo XYZ"
                                        required
                                        value={formData.modelo}
                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-serie">Serie</Label>
                                    <Input
                                        id="eq-serie"
                                        placeholder="SN-123456"
                                        required
                                        value={formData.serie}
                                        onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Estado y Mantenimiento</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-estado">Estado</Label>
                                    <select
                                        id="eq-estado"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="mantenimiento">En Mantenimiento</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-mant">Último Mant.</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="eq-mant"
                                            type="date"
                                            className="pl-9"
                                            required
                                            value={formData.ultimo_mantenimiento}
                                            onChange={(e) => setFormData({ ...formData, ultimo_mantenimiento: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            {loading ? "Guardando..." : "Registrar Equipo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditarEquipoDialog({ clienteId, equipo }: { clienteId: string; equipo: Equipo }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: equipo.nombre,
        modelo: equipo.modelo,
        serie: equipo.serie,
        estado: equipo.estado,
        ultimo_mantenimiento: equipo.ultimo_mantenimiento
            ? (equipo.ultimo_mantenimiento instanceof Date
                ? equipo.ultimo_mantenimiento.toISOString().split('T')[0]
                : (equipo.ultimo_mantenimiento as any).toDate().toISOString().split('T')[0])
            : new Date().toISOString().split('T')[0],
    });

    // Update form data when equipment or open state changes
    useEffect(() => {
        if (open) {
            setFormData({
                nombre: equipo.nombre,
                modelo: equipo.modelo,
                serie: equipo.serie,
                estado: equipo.estado,
                ultimo_mantenimiento: equipo.ultimo_mantenimiento
                    ? (equipo.ultimo_mantenimiento instanceof Date
                        ? equipo.ultimo_mantenimiento.toISOString().split('T')[0]
                        : new Date((equipo.ultimo_mantenimiento as any)).toISOString().split('T')[0])
                    : new Date().toISOString().split('T')[0],
            });
        }
    }, [equipo, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Append time to ensure it doesn't shift day due to timezone
            const dateValue = new Date(`${formData.ultimo_mantenimiento}T12:00:00`);
            await updateEquipo(clienteId, equipo.id, {
                ...formData,
                ultimo_mantenimiento: dateValue,
            });
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error updating equipment:", error);
            setLoading(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            await deleteEquipo(clienteId, equipo.id);
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error deleting equipment:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full">
                    <Pencil className="h-4 w-4 text-slate-400 hover:text-primary transition-colors" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Equipo</DialogTitle>
                        <DialogDescription>
                            Modifique los datos del equipo o elimínelo si ya no es necesario.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información del Equipo</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-eq-nombre">Nombre</Label>
                                <Input
                                    id="edit-eq-nombre"
                                    placeholder="Ej: Aire Acondicionado"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-modelo">Modelo</Label>
                                    <Input
                                        id="edit-eq-modelo"
                                        placeholder="Modelo XYZ"
                                        required
                                        value={formData.modelo}
                                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-serie">Serie</Label>
                                    <Input
                                        id="edit-eq-serie"
                                        placeholder="SN-123456"
                                        required
                                        value={formData.serie}
                                        onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Estado y Mantenimiento</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-estado">Estado</Label>
                                    <select
                                        id="edit-eq-estado"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="mantenimiento">En Mantenimiento</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-mant">Último Mant.</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="edit-eq-mant"
                                            type="date"
                                            className="pl-9"
                                            required
                                            value={formData.ultimo_mantenimiento}
                                            onChange={(e) => setFormData({ ...formData, ultimo_mantenimiento: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showDeleteConfirm && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                            <strong>¿Eliminar equipo?</strong> Confirme si realmente desea eliminar este equipo.
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                        <Button
                            type="button"
                            variant={showDeleteConfirm ? "destructive" : "outline"}
                            className={showDeleteConfirm ? "" : "text-red-600 border-red-200 hover:bg-red-50"}
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {showDeleteConfirm ? "Confirmar" : "Eliminar"}
                        </Button>
                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                            <Button type="button" variant="ghost" onClick={() => { setOpen(false); setShowDeleteConfirm(false); }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Spinner className="mr-2 h-4 w-4" />}
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function NuevoClienteDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        ruc: "",
        phone: "",
        address: "",
        contact_name: "",
        email: "",
        lat: 0,
        lng: 0,
    });

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address, lat, lng }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCliente(formData);
            setLoading(false);
            setOpen(false);
            setFormData({
                name: "",
                ruc: "",
                phone: "",
                address: "",
                contact_name: "",
                email: "",
                lat: 0,
                lng: 0,
            });
        } catch (error) {
            console.error("Error creating client:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del cliente para registrarlo en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información General</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Razón Social</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Empresa S.A.C."
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="ruc">RUC</Label>
                                    <Input
                                        id="ruc"
                                        placeholder="20123456789"
                                        required
                                        value={formData.ruc}
                                        onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono"
                                        placeholder="+51 1 234 5678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Ubicación</h4>
                            <AddressPicker
                                onAddressSelect={handleAddressSelect}
                                initialAddress={formData.address}
                            />
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Contacto</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contacto">Contacto Principal</Label>
                                    <Input
                                        id="contacto"
                                        placeholder="Nombre del contacto"
                                        value={formData.contact_name}
                                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@empresa.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
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

function EditarClienteDialog({ cliente }: { cliente: Cliente }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        ruc: "",
        phone: "",
        address: "",
        contact_name: "",
        email: "",
        lat: 0,
        lng: 0,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: cliente.name || "",
                ruc: cliente.ruc || "",
                phone: cliente.phone || "",
                address: cliente.address || "",
                contact_name: cliente.contact_name || "",
                email: cliente.email || "",
                lat: cliente.location?.latitude || 0,
                lng: cliente.location?.longitude || 0,
            });
        }
    }, [open, cliente]);

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address, lat, lng }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateCliente(cliente.id, formData);
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error updating client:", error);
            setLoading(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            await deleteCliente(cliente.id);
            setLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Error deleting client:", error);
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                            Modifique los datos del cliente o elimine su registro.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {/* Section: Información General */}
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Información General</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre">Razón Social</Label>
                                <Input
                                    id="edit-nombre"
                                    placeholder="Empresa S.A.C."
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-ruc">RUC</Label>
                                    <Input
                                        id="edit-ruc"
                                        placeholder="20123456789"
                                        required
                                        value={formData.ruc}
                                        onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-telefono">Teléfono</Label>
                                    <Input
                                        id="edit-telefono"
                                        placeholder="+51 1 234 5678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Ubicación */}
                        <div className="grid gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Ubicación</h4>
                            <AddressPicker
                                onAddressSelect={handleAddressSelect}
                                initialAddress={formData.address}
                            />
                        </div>

                        {/* Section: Contacto */}
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Contacto</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-contacto">Contacto Principal</Label>
                                    <Input
                                        id="edit-contacto"
                                        placeholder="Nombre del contacto"
                                        value={formData.contact_name}
                                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        placeholder="email@empresa.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {showDeleteConfirm && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                            <strong>¿Confirmar eliminación?</strong> Esta acción no se puede deshacer y borrará toda la información del cliente.
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                        <Button
                            type="button"
                            variant={showDeleteConfirm ? "destructive" : "outline"}
                            className={showDeleteConfirm ? "" : "text-red-600 border-red-200 hover:bg-red-50"}
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {showDeleteConfirm ? "Confirmar Eliminación" : "Eliminar Cliente"}
                        </Button>
                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                            <Button type="button" variant="ghost" onClick={() => { setOpen(false); setShowDeleteConfirm(false); }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Spinner className="mr-2 h-4 w-4" />}
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ClienteCardMobile({ cliente }: { cliente: Cliente }) {
    const [expanded, setExpanded] = useState(false);
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    useEffect(() => {
        if (expanded) {
            const unsubscribe = subscribeToEquipos(cliente.id, (data) => {
                setEquipos(data);
            });
            return () => unsubscribe();
        }
    }, [expanded, cliente.id]);

    return (
        <Card className="mb-4 shadow-sm border-slate-200">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{cliente.name}</p>
                            <p className="text-sm text-muted-foreground">RUC: {cliente.ruc || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <EditarClienteDialog cliente={cliente} />
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{cliente.address || "Sin dirección"}</span>
                    </div>
                    {cliente.contact_name && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.contact_name}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                        <Wrench className="h-3 w-3" />
                        {equipos.length} equipos
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-primary hover:text-primary/80"
                    >
                        {expanded ? "Ocultar" : "Ver Detalles"}
                        {expanded ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>

                {expanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium text-sm">Catálogo de Equipos</h4>
                            <NuevoEquipoDialog clienteId={cliente.id} />
                        </div>

                        {equipos.length > 0 ? (
                            <div className="space-y-3">
                                {equipos.map((equipo) => (
                                    <div key={equipo.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                                        <div className="absolute top-2 right-2">
                                            <EditarEquipoDialog clienteId={cliente.id} equipo={equipo} />
                                        </div>
                                        <div className="pr-8">
                                            <p className="font-medium text-sm">{equipo.nombre}</p>
                                            <p className="text-xs text-muted-foreground">{equipo.modelo} - {equipo.serie}</p>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                Mant: {equipo.ultimo_mantenimiento
                                                    ? format(new Date(equipo.ultimo_mantenimiento as Date), "dd MMM", { locale: es })
                                                    : "N/A"}
                                            </span>
                                            {getEstadoBadge(equipo.estado)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay equipos registrados</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

}

export default function ClientesPage() {
    const [search, setSearch] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    // Equipment stats state - aggregated from all clients
    const [equipmentStats, setEquipmentStats] = useState<{
        total: number;
        enMantenimiento: number;
    }>({ total: 0, enMantenimiento: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const unsubscribe = subscribeToClientes((data) => {
            setClientes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter type for stats cards
    const [statsFilter, setStatsFilter] = useState<"all" | "withEquipment" | "inMaintenance">("all");

    // Track equipment per client for filtering
    const [equipmentByClient, setEquipmentByClient] = useState<Record<string, Equipo[]>>({});

    // Subscribe to all equipment to calculate stats
    useEffect(() => {
        if (clientes.length === 0) return;

        const unsubscribers: (() => void)[] = [];
        const equipment: Record<string, Equipo[]> = {};

        clientes.forEach(cliente => {
            const unsub = subscribeToEquipos(cliente.id, (equipos) => {
                equipment[cliente.id] = equipos;

                // Update state with current equipment map
                setEquipmentByClient({ ...equipment });

                // Recalculate totals
                let total = 0;
                let enMantenimiento = 0;
                Object.values(equipment).forEach(eqs => {
                    total += eqs.length;
                    enMantenimiento += eqs.filter(e => e.estado === "mantenimiento").length;
                });

                setEquipmentStats({ total, enMantenimiento });
            });
            unsubscribers.push(unsub);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [clientes]);

    const filteredClientes = clientes.filter((cliente) => {
        // Search filter
        const matchesSearch =
            cliente.name.toLowerCase().includes(search.toLowerCase()) ||
            (cliente.ruc && cliente.ruc.includes(search));

        // Stats card filter
        const clientEquipment = equipmentByClient[cliente.id] || [];
        let matchesStatsFilter = true;

        if (statsFilter === "withEquipment") {
            matchesStatsFilter = clientEquipment.length > 0;
        } else if (statsFilter === "inMaintenance") {
            matchesStatsFilter = clientEquipment.some(e => e.estado === "mantenimiento");
        }

        return matchesSearch && matchesStatsFilter;
    });

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statsFilter]);

    const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
    const paginatedClientes = filteredClientes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <AdminLayout title="Gestión de Clientes">
            <div className="space-y-6">
                {/* Stats Cards - Now at the top */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card
                        onClick={() => setStatsFilter("all")}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-blue-50 to-primary/5 border-primary/20 shadow-sm ${statsFilter === "all" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl shadow-sm">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{clientes.length}</p>
                                <p className="text-sm text-muted-foreground font-medium">Clientes Totales</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        onClick={() => setStatsFilter(statsFilter === "withEquipment" ? "all" : "withEquipment")}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-sm ${statsFilter === "withEquipment" ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
                    >
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                                <Wrench className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-600">{equipmentStats.total}</p>
                                <p className="text-sm text-green-700/80 font-medium">Equipos Registrados</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        onClick={() => setStatsFilter(statsFilter === "inMaintenance" ? "all" : "inMaintenance")}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 shadow-sm ${statsFilter === "inMaintenance" ? "ring-2 ring-amber-500 ring-offset-2" : ""}`}
                    >
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm">
                                <Settings className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-amber-600">{equipmentStats.enMantenimiento}</p>
                                <p className="text-sm text-amber-700/80 font-medium">En Mantenimiento</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Header Actions - Search and New Client button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar clientes..."
                            className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <NuevoClienteDialog />
                </div>

                {/* Desktop Clients Table - Visible on md and up */}
                <Card className="hidden md:block border-slate-200 shadow-md">
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
                                            {paginatedClientes.map((cliente) => (
                                                <ClienteRow key={cliente.id} cliente={cliente} />
                                            ))}
                                            {paginatedClientes.length === 0 && (
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
                </Card >

                {/* Mobile Clients List - Visible on small screens */}
                < div className="md:hidden space-y-4" >
                    <div className="flex items-center justify-between pb-2">
                        <h2 className="text-lg font-semibold">Lista de Clientes</h2>
                        <span className="text-sm text-muted-foreground">{filteredClientes.length} resultados</span>
                    </div>

                    {
                        loading ? (
                            <div className="text-center py-8">
                                <Spinner className="h-8 w-8 mx-auto" />
                                <p className="text-sm text-muted-foreground mt-2">Cargando clientes...</p>
                            </div>
                        ) : paginatedClientes.length > 0 ? (
                            paginatedClientes.map((cliente) => (
                                <ClienteCardMobile key={cliente.id} cliente={cliente} />
                            ))
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No se encontraron clientes</p>
                            </div>
                        )
                    }
                </div >

                {/* Pagination Controls */}
                {
                    !loading && filteredClientes.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredClientes.length)} de {filteredClientes.length} clientes
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">Anterior</span>
                                </Button>
                                <div className="text-sm font-medium">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">Siguiente</span>
                                </Button>
                            </div>
                        </div>
                    )
                }
            </div >
        </AdminLayout >
    );
}
