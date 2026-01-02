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
    AlertCircle
} from "lucide-react";
import {
    subscribeToServices,
    createService,
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
    switch (status) {
        case "PENDIENTE": return <Badge variant="outline" className="border-amber-500 text-amber-600">Pendiente</Badge>;
        case "EN_PROGRESO": return <Badge variant="default" className="bg-blue-600">En Progreso</Badge>;
        case "COMPLETADO": return <Badge variant="success">Completado</Badge>;
        case "CANCELADO": return <Badge variant="destructive">Cancelado</Badge>;
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

export default function ServiciosPage() {
    const [services, setServices] = useState<Task[]>([]);
    const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubServices = subscribeToServices(
            (data: Task[]) => {
                setServices(data);
                // Also load techs and clients
                // For simplicity, we trigger these calls here or could be separate effects
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
                <div className="flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar servicios..." className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm" />
                    </div>
                    <NuevoServicioDialog tecnicos={tecnicos} clientes={clientes} />
                </div>

                {/* List View */}
                <Card className="border-slate-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Servicios Programados</CardTitle>
                        <CardDescription>Lista de tareas asignadas a los técnicos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Spinner className="h-8 w-8 text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Técnico</TableHead>
                                        <TableHead>Prioridad</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id} className="hover:bg-muted/50 cursor-pointer">
                                            <TableCell className="font-medium">
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
                                            <TableCell>
                                                <div className="flex flex-col max-w-[200px]">
                                                    <span className="font-medium truncate">{service.equipmentSummary}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{service.contactName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {/* Lookup technician name since it might not be in the task doc */}
                                                    {tecnicos.find(t => t.id === service.technicianId)?.full_name || "Técnico"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getPriorityBadge(service.priority)}
                                            </TableCell>
                                            <TableCell>
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
