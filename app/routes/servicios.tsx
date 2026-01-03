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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Plus,
    Search,
    User,
    Briefcase,
    AlertCircle,
    MessageCircle,
    PhoneCall,
    CheckCircle2,
    Loader2
} from "lucide-react";
import {
    subscribeToServices,
    createService,
    updateServiceStatus,
    type Task
} from "~/lib/services";
import { subscribeToUsuarios, type Usuario } from "~/lib/firestore";
// We need clients too, assuming we have a fetch function or just subscribing
import { subscribeToClientes, type Cliente } from "~/lib/firestore";

// Helper for Priority Badge
function getPriorityBadge(priority: string) {
    const styles = {
        BAJA: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        MEDIA: "bg-amber-100 text-amber-800 hover:bg-amber-200",
        ALTA: "bg-orange-100 text-orange-800 hover:bg-orange-200",
        URGENTE: "bg-red-100 text-red-800 hover:bg-red-200",
    };
    return <Badge className={styles[priority as keyof typeof styles] || styles.BAJA}>{priority}</Badge>;
}

function getStatusBadge(status: string) {
    switch (status.toUpperCase()) {
        case "PENDIENTE": return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50/50">Pendiente</Badge>;
        case "EN_PROGRESO": return <Badge variant="default" className="bg-blue-600 shadow-sm">En Progreso</Badge>;
        case "COMPLETADO": return <Badge variant="success" className="shadow-sm">Completado</Badge>;
        case "CANCELADO": return <Badge variant="destructive" className="shadow-sm">Cancelado</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

function NuevoServicioDialog({
    tecnicos,
    clientes
}: {
    tecnicos: Usuario[],
    clientes: Cliente[]
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientId: "",
        technicianId: "",
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        startTime: "09:00",
        endTime: "10:00",
        priority: "MEDIA" as Task["priority"],
        description: "",
        equipment: "",
        contactName: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Find selected objects for names
            const client = clientes.find(c => c.id === formData.clientId);
            const tecnico = tecnicos.find(t => t.id === formData.technicianId);

            if (!client || !tecnico) throw new Error("Cliente o Técnico no válido");

            await createService({
                clientName: client.name || "Cliente",
                clientAddress: client.address || "",
                contactName: formData.contactName || client.contact_name || "Contacto",
                technicianId: tecnico.id,
                technicianName: tecnico.full_name || "Técnico", // Note: This might not be stored in Task based on screenshot but useful for UI locally? 
                // Wait, screenshot shows 'technicianId' but not name. 
                // But for list display we need name. 
                // We'll rely on joining with technicianId or storing it if the schema allows extra fields. 
                // Detailed check: Screenshot only shows 'technicianId'. 
                // However, storing technicianName is standard for denormalization unless we subscribe to all users.
                // I will NOT store technicianName in the DB if the screenshot implies strict schema, 
                // BUT for the UI list we need to look it up.
                // Let's pass the other fields.

                date: new Date(formData.date), // For Date sorting helper
                startTime: formData.startTime, // For helper to build string
                endTime: formData.endTime, // For helper to build string
                priority: formData.priority,
                description: formData.description, // Will map to equipmentSummary or description? Screenshot has equipmentSummary.
                // Let's map 'equipment' to 'equipmentSummary' + description.
                equipment: formData.equipment + (formData.description ? ` · ${formData.description}` : ""),
            });

            setOpen(false);
            // Reset form
            setFormData({
                clientId: "",
                technicianId: "",
                date: new Date().toISOString().split('T')[0],
                startTime: "09:00",
                endTime: "10:00",
                priority: "MEDIA",
                description: "",
                equipment: "",
                contactName: "",
            });
        } catch (error) {
            console.error("Error creating service:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Programar Nuevo Servicio</DialogTitle>
                        <DialogDescription>
                            Asigna una tarea a un técnico específico.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Técnico</Label>
                                <Select
                                    value={formData.technicianId}
                                    onValueChange={(val) => setFormData({ ...formData, technicianId: val })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Asignar Técnico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tecnicos.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nombre de Contacto</Label>
                            <Input
                                placeholder="Ej: Marco Atencio"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Inicio</Label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fin</Label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val: "BAJA" | "MEDIA" | "ALTA" | "URGENTE") => setFormData({ ...formData, priority: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BAJA">Baja</SelectItem>
                                    <SelectItem value="MEDIA">Media</SelectItem>
                                    <SelectItem value="ALTA">Alta</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Equipo / Activo</Label>
                            <Input
                                placeholder="Ej: XR-500 Industrial"
                                value={formData.equipment}
                                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción / Notas</Label>
                            <Input
                                placeholder="Detalles de la tarea..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            Programar Servicio
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DetalleServicioDialog({
    service,
    tecnico,
    open,
    onOpenChange
}: {
    service: Task | null,
    tecnico: Usuario | undefined,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [updating, setUpdating] = useState(false);

    if (!service) return null;

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            await updateServiceStatus(service.id, newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdating(false);
        }
    };

    const openWhatsApp = (phone?: string, message?: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, "");
        const url = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(message || "")}`;
        window.open(url, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-gradient-to-br from-primary via-primary to-secondary p-6 text-white relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            SERVICIO #{service.id.slice(-4).toUpperCase()}
                        </div>
                        {getStatusBadge(service.status)}
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Detalle del Servicio</DialogTitle>
                    <DialogDescription className="text-white/80 mt-1">
                        Gestiona y visualiza la información de la tarea.
                    </DialogDescription>
                </div>

                <div className="p-6 grid gap-6 max-h-[70vh] overflow-y-auto bg-white">
                    {/* Cliente Section */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
                            <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-1">Cliente</h4>
                            <p className="font-bold text-lg text-slate-900">{service.clientName}</p>
                            <div className="space-y-1.5 mt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                    {service.address}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="h-4 w-4 text-primary/60" />
                                    Contacto: <span className="font-medium">{service.contactName}</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl"
                                onClick={() => openWhatsApp("", `Hola ${service.contactName}, le escribimos de MANGRO respecto a su servicio programado...`)}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contactar Cliente
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">Programación</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                    {new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(service.date || new Date())}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Clock className="h-4 w-4 text-primary" />
                                    {service.scheduledTime}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">Prioridad</h4>
                            {getPriorityBadge(service.priority)}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Técnico Asignado</h4>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                            <div className="relative">
                                {tecnico?.photo_url ? (
                                    <img src={tecnico.photo_url} alt={tecnico.full_name} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-white shadow-sm">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-green-500 h-3.5 w-3.5 rounded-full border-2 border-white" title="Activo"></div>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">{tecnico?.full_name || "Sin asignar"}</p>
                                <p className="text-xs font-medium text-primary/70 uppercase tracking-tighter">{tecnico?.role || "Técnico"}</p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
                                onClick={() => openWhatsApp(tecnico?.phone, `Hola ${tecnico?.full_name}, tienes un servicio pendiente en ${service.clientName}...`)}
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Equipo y Descripción</h4>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <AlertCircle className="h-4 w-4" />
                                {service.equipmentSummary}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                "{service.description || "Sin descripción adicional proporcionada."}"
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Actualizar Estado</h4>
                        <div className="flex gap-2">
                            <Select
                                value={service.status}
                                onValueChange={handleStatusChange}
                                disabled={updating}
                            >
                                <SelectTrigger className="flex-1 rounded-xl h-11 border-slate-200">
                                    <SelectValue placeholder="Cambiar estado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                                    <SelectItem value="COMPLETADO">Completado</SelectItem>
                                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            {updating && (
                                <div className="flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button variant="ghost" className="rounded-xl w-full" onClick={() => onOpenChange(false)}>
                        Cerrar Detalle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ServiciosPage() {
    const [services, setServices] = useState<Task[]>([]);
    const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<Task | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        const unsubServices = subscribeToServices(
            (data: Task[]) => {
                const normalizedData = data.map(task => ({
                    ...task,
                    status: (task.status?.toUpperCase() || 'PENDIENTE') as Task["status"]
                }));
                setServices(normalizedData);
            },
            console.error
        );

        const unsubTechs = subscribeToUsuarios((data: Usuario[]) => {
            setTecnicos(data.filter(u => u.role === "TECNICO"));
        }, console.error);

        const unsubClients = subscribeToClientes((data: Cliente[]) => {
            setClientes(data);
            setLoading(false);
        });

        return () => {
            unsubServices();
            unsubTechs();
            unsubClients();
        };
    }, []);

    // Helper to format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-PE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).format(date);
    };

    return (
        <AdminLayout title="Gestión de Servicios">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar servicios..." className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm w-full" />
                    </div>
                    <NuevoServicioDialog tecnicos={tecnicos} clientes={clientes} />
                </div>

                {/* List View */}
                <Card className="border-slate-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Servicios Programados</CardTitle>
                        <CardDescription>Lista de tareas asignadas a los técnicos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 pb-0">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Spinner className="h-8 w-8 text-primary" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="w-[120px]">Fecha</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                            <TableHead className="hidden sm:table-cell">Técnico</TableHead>
                                            <TableHead className="hidden lg:table-cell">Prioridad</TableHead>
                                            <TableHead className="text-right sm:text-left">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((service) => (
                                            <TableRow
                                                key={service.id}
                                                className="hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedService(service);
                                                    setDetailOpen(true);
                                                }}
                                            >
                                                <TableCell className={`font-medium border-l-4 ${service.status?.toUpperCase() === 'COMPLETADO' ? 'border-l-green-500' :
                                                    service.status?.toUpperCase() === 'EN_PROGRESO' ? 'border-l-blue-500' :
                                                        service.status?.toUpperCase() === 'CANCELADO' ? 'border-l-red-500' :
                                                            'border-l-amber-500'
                                                    }`}>
                                                    <div className="flex flex-col">
                                                        {/* We use service.date if available (we added it as helper) or createAt */}
                                                        <span>{formatDate(service.date || new Date())}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {service.scheduledTime}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{service.clientName}</span>
                                                        <span className="text-xs text-muted-foreground">{service.address}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="font-medium truncate">{service.equipmentSummary}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{service.contactName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {/* Lookup technician name since it might not be in the task doc */}
                                                        <span className="truncate">
                                                            {tecnicos.find(t => t.id === service.technicianId)?.full_name || "Técnico"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {getPriorityBadge(service.priority)}
                                                </TableCell>
                                                <TableCell className="text-right sm:text-left">
                                                    {getStatusBadge(service.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {services.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No hay servicios programados
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DetalleServicioDialog
                service={selectedService}
                tecnico={tecnicos.find(t => t.id === selectedService?.technicianId)}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </AdminLayout>
    );
}
