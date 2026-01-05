
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
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
    User,
    Briefcase,
    AlertCircle,
    MessageCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { updateServiceStatus, type Task } from "~/lib/services";
import { type User as UserType } from "~/lib/firestore";
import { StatusBadge } from "~/components/ui/status-badge";
import { PriorityBadge } from "~/components/ui/priority-badge";

interface ServiceDetailDialogProps {
    service: Task | null;
    technician: UserType | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServiceDetailDialog({
    service,
    technician,
    open,
    onOpenChange,
}: ServiceDetailDialogProps) {
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
        const url = `https://wa.me/${cleanPhone.startsWith("51") ? cleanPhone : "51" + cleanPhone}?text=${encodeURIComponent(message || "")}`;
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
                        <StatusBadge status={service.status} />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        Detalle del Servicio
                    </DialogTitle>
                    <DialogDescription className="text-white/80 mt-1">
                        Gestione y vea la información de la tarea.
                    </DialogDescription>
                </div>

                <div className="p-6 grid gap-6 max-h-[70vh] overflow-y-auto bg-white">
                    {/* Client Section */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
                            <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-1">
                                Cliente
                            </h4>
                            <p className="font-bold text-lg text-slate-900">{service.clientName}</p>
                            <div className="space-y-1.5 mt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                    {service.address}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="h-4 w-4 text-primary/60" />
                                    Contacto:{" "}
                                    <span className="font-medium">{service.contactName}</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl"
                                onClick={() =>
                                    openWhatsApp(
                                        "",
                                        `Hola ${service.contactName}, le escribimos de MANGRO respecto a su servicio programado...`
                                    )
                                }
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contactar Cliente
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">
                                Programación
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                    {new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(
                                        service.date || new Date()
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Clock className="h-4 w-4 text-primary" />
                                    {service.scheduledTime}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">
                                Prioridad
                            </h4>
                            <PriorityBadge priority={service.priority} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                            Técnico Asignado
                        </h4>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                            <div className="relative">
                                {technician?.photoUrl ? (
                                    <img
                                        src={technician.photoUrl}
                                        alt={technician.fullName}
                                        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-white shadow-sm">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                )}
                                <div
                                    className="absolute -bottom-1 -right-1 bg-green-500 h-3.5 w-3.5 rounded-full border-2 border-white"
                                    title="Activo"
                                ></div>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">
                                    {technician?.fullName || "Sin Asignar"}
                                </p>
                                <p className="text-xs font-medium text-primary/70 uppercase tracking-tighter">
                                    {technician?.role || "Técnico"}
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
                                onClick={() =>
                                    openWhatsApp(
                                        technician?.phone,
                                        `Hola ${technician?.fullName}, tienes un servicio pendiente en ${service.clientName}...`
                                    )
                                }
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                            Equipos y Descripción
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <AlertCircle className="h-4 w-4" />
                                {service.equipmentSummary}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed italic">
                                &ldquo;{service.description || "No se proporcionó descripción adicional."}
                                &rdquo;
                            </p>

                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    <div className="space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                            Actualizar Estado
                        </h4>
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
                    <Button
                        variant="ghost"
                        className="rounded-xl w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar Detalle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
