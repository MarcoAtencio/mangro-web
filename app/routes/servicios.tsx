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
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    X
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
function getPriorityBadge(priority: string | undefined) {
    const baseClasses = "min-w-20 justify-center text-center font-medium";

    if (!priority) {
        return <Badge variant="outline" className={`${baseClasses} bg-slate-100 text-slate-800 border-slate-200`}>-</Badge>;
    }

    const normalizedPriority = priority.toUpperCase();
    const styles = {
        BAJA: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
        MEDIA: "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
        ALTA: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200",
        URGENTE: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
    };

    const labels = {
        BAJA: "Baja",
        MEDIA: "Media",
        ALTA: "Alta",
        URGENTE: "Urgente"
    };

    return (
        <Badge variant="outline" className={`${baseClasses} ${styles[normalizedPriority as keyof typeof styles] || styles.BAJA}`}>
            {labels[normalizedPriority as keyof typeof labels] || priority}
        </Badge>
    );
}

function getStatusBadge(status: string) {
    const normalizedStatus = status?.toUpperCase() || '';
    const baseClasses = "min-w-24 justify-center text-center whitespace-nowrap font-medium";

    switch (normalizedStatus) {
        case "PENDIENTE":
            return (
                <Badge variant="outline" className={`${baseClasses} border-amber-400 text-amber-700 bg-amber-50`}>
                    Pendiente
                </Badge>
            );
        case "EN_PROGRESO":
            return (
                <Badge className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-sm`}>
                    En Progreso
                </Badge>
            );
        case "COMPLETADO":
            return (
                <Badge className={`${baseClasses} bg-green-600 text-white hover:bg-green-700 shadow-sm`}>
                    Completado
                </Badge>
            );
        case "CANCELADO":
            return (
                <Badge variant="destructive" className={`${baseClasses} shadow-sm`}>
                    Cancelado
                </Badge>
            );
        default:
            return <Badge variant="outline" className={baseClasses}>{status || '-'}</Badge>;
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
                companyId: client.id, // Link task to client/company
                clientName: client.name || "Cliente",
                clientAddress: client.address || "",
                contactName: formData.contactName || client.contact_name || "Contacto",
                technicianId: tecnico.id,
                date: new Date(formData.date),
                startTime: formData.startTime,
                endTime: formData.endTime,
                priority: formData.priority,
                description: formData.description,
                equipment: formData.equipment,
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

    // Filter and Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTechnician, setFilterTechnician] = useState<string>("all");
    const [filterClient, setFilterClient] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get unique clients from services for filter
    const uniqueClients = [...new Set(services.map(s => s.clientName))].filter(Boolean);

    // Stats for summary cards
    const stats = {
        pendiente: services.filter(s => s.status === "PENDIENTE").length,
        enProgreso: services.filter(s => s.status === "EN_PROGRESO").length,
        completado: services.filter(s => s.status === "COMPLETADO").length,
        total: services.length
    };

    // Filtered services
    const filteredServices = services.filter(service => {
        const technicianName = tecnicos.find(t => t.id === service.technicianId)?.full_name || "";

        // Search filter
        const matchesSearch = searchQuery === "" ||
            service.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.equipmentSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            technicianName.toLowerCase().includes(searchQuery.toLowerCase());

        // Technician filter
        const matchesTechnician = filterTechnician === "all" || service.technicianId === filterTechnician;

        // Client filter
        const matchesClient = filterClient === "all" || service.clientName === filterClient;

        // Status filter
        const matchesStatus = filterStatus === "all" || service.status === filterStatus;

        return matchesSearch && matchesTechnician && matchesClient && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterTechnician, filterClient, filterStatus]);

    // Check if any filter is active
    const hasActiveFilters = searchQuery !== "" || filterTechnician !== "all" || filterClient !== "all" || filterStatus !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setFilterTechnician("all");
        setFilterClient("all");
        setFilterStatus("all");
    };

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
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-white to-slate-50 ${filterStatus === 'all' ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Total</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-sm">
                                    <Briefcase className="h-6 w-6 text-slate-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 ${filterStatus === 'PENDIENTE' ? 'ring-2 ring-amber-500 shadow-lg' : 'shadow-sm'}`}
                        onClick={() => setFilterStatus(filterStatus === 'PENDIENTE' ? 'all' : 'PENDIENTE')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700/80 font-medium">Pendientes</p>
                                    <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendiente}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 ${filterStatus === 'EN_PROGRESO' ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm'}`}
                        onClick={() => setFilterStatus(filterStatus === 'EN_PROGRESO' ? 'all' : 'EN_PROGRESO')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700/80 font-medium">En Progreso</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.enProgreso}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                                    <Loader2 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 ${filterStatus === 'COMPLETADO' ? 'ring-2 ring-green-500 shadow-lg' : 'shadow-sm'}`}
                        onClick={() => setFilterStatus(filterStatus === 'COMPLETADO' ? 'all' : 'COMPLETADO')}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700/80 font-medium">Completados</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.completado}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-52">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm"
                            />
                        </div>

                        {/* Technician Filter */}
                        <Select value={filterTechnician} onValueChange={setFilterTechnician}>
                            <SelectTrigger className="w-full sm:w-40 h-9 bg-white border-slate-200 shadow-sm">
                                <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {tecnicos.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Client Filter */}
                        <Select value={filterClient} onValueChange={setFilterClient}>
                            <SelectTrigger className="w-full sm:w-40 h-9 bg-white border-slate-200 shadow-sm">
                                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {uniqueClients.map(clientName => (
                                    <SelectItem key={clientName} value={clientName}>{clientName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-36 h-9 bg-white border-slate-200 shadow-sm">
                                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                                <SelectItem value="COMPLETADO">Completado</SelectItem>
                                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                                Limpiar
                            </Button>
                        )}
                    </div>

                    <NuevoServicioDialog tecnicos={tecnicos} clientes={clientes} />
                </div>

                {/* Results Summary - only show when filters active */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="gap-1">
                            <Filter className="h-3 w-3" />
                            {filteredServices.length} resultado{filteredServices.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                )}


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
                                        {paginatedServices.map((service) => (
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
                                        {filteredServices.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    {services.length === 0
                                                        ? "No hay servicios programados"
                                                        : "No se encontraron servicios con los filtros seleccionados"
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>

                                </Table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {filteredServices.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 px-4 sm:px-0 border-t border-slate-100 mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredServices.length)} de {filteredServices.length} servicios
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <div className="flex items-center gap-1 px-2">
                                        <span className="text-sm font-medium">{currentPage}</span>
                                        <span className="text-muted-foreground text-sm">de</span>
                                        <span className="text-sm font-medium">{totalPages}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="gap-1"
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
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
