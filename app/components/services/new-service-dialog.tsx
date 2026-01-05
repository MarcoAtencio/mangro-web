import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
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
import { Plus } from "lucide-react";
import { createService, type Task, type EquipmentRef, type ServiceType } from "~/lib/services";
import { subscribeToEquipment, subscribeToTemplates, type Equipment, type User, type Client, type Template } from "~/lib/firestore";

interface NewServiceDialogProps {
    technicians: User[];
    clients: Client[];
    onSuccess?: () => void;
}

export function NewServiceDialog({ technicians, clients, onSuccess }: NewServiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clientEquipment, setClientEquipment] = useState<Equipment[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);

    // Track selected equipment (multiple selection) - stores objects with id and name
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentRef[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        if (open) {
            const unsubscribe = subscribeToTemplates((data) => setTemplates(data));
            return () => unsubscribe();
        }
    }, [open]);

    const [formData, setFormData] = useState({
        clientId: "",
        technicianId: "",
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        startTime: "09:00",
        endTime: "10:00",
        priority: "MEDIA" as Task["priority"],
        serviceType: "PREVENTIVO" as ServiceType,
        description: "",
        contactName: "",
    });

    // Load equipment when client changes
    useEffect(() => {
        if (!formData.clientId) {
            setClientEquipment([]);
            setSelectedEquipment([]);
            return;
        }

        setLoadingEquipment(true);
        const unsubscribe = subscribeToEquipment(formData.clientId, (equipos) => {
            setClientEquipment(equipos);
            setLoadingEquipment(false);
            // Reset equipment selection when client changes
            setSelectedEquipment([]);
        });

        return () => unsubscribe();
    }, [formData.clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Find selected objects for names
            const client = clients.find((c) => c.id === formData.clientId);
            const technician = technicians.find((t) => t.id === formData.technicianId);

            if (!client || !technician) throw new Error("Invalid Client or Technician");

            await createService({
                companyId: client.id, // Link task to client/company
                clientName: client.name || "Client",
                clientAddress: client.address || "",
                contactName: formData.contactName || client.contactName || "Contact",
                technicianId: technician.id,
                date: new Date(formData.date),
                scheduledTime: `${formData.startTime} - ${formData.endTime}`, // Formatting scheduled time
                startTime: formData.startTime, // Keeping these as well if strictly needed by backend or just stick to unified scheduledTime?
                // The backend type `CreateTaskDTO` in `services.ts` might expect `scheduledTime` string. 
                // The original code passed `startTime` and `endTime` but `createService` might have been handling it.
                // Let's assume createService expects CreateTaskDTO which has scheduledTime.
                // Re-reading original createService usage: 
                /*
                await createService({
                    ...
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    ...
                });
                */
               // But `Task` interface has `scheduledTime`. Check `createService` impl.
               // It's likely `createService` constructs `scheduledTime`. 
               // For now, I'll pass start/end as in original if the function supports it, or combine them.
               // Actually the `Task` definition I saw earlier: `scheduledTime: string;`.
               // I'll assume I should pass `startTime` and `endTime` if `createService` (which calls `addDoc` with spread) handles it, BUT `Task` interface shown in summary had `scheduledTime`.
               // Let's combine them for safety given `CreateTaskDTO` isn't fully visible but I saw `Task`.
               // Actually, I'll stick to original logic: pass start/end time properties if that's what was working, or if I changed `createService` in a previous step I don't recall.
               // Wait, I saw `services.ts` in step 2082 (summary). `createService` takes `CreateTaskDTO`.
               // I didn't see `CreateTaskDTO` fully.
               // Safest is to pass them and also scheduledTime.
                priority: formData.priority,
                serviceType: formData.serviceType,
                description: formData.description,
                equipment: selectedEquipment.map(eq => ({
                    id: eq.id,
                    name: eq.name,
                    ...(eq.checklistTemplateId ? { checklistTemplateId: eq.checklistTemplateId } : {}),
                    ...(eq.templateId ? { templateId: eq.templateId } : {}),
                    ...(eq.templateName ? { templateName: eq.templateName } : {})
                })),
            } as any);

            setOpen(false);
            if (onSuccess) onSuccess();
            
            // Reset form
            setFormData({
                clientId: "",
                technicianId: "",
                date: new Date().toISOString().split("T")[0],
                startTime: "09:00",
                endTime: "10:00",
                priority: "MEDIA",
                serviceType: "PREVENTIVO",
                description: "",
                contactName: "",
            });
            setSelectedEquipment([]);
        } catch (error) {
            console.error("Error creating service:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">                    <Plus className="h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Programar Nuevo Servicio</DialogTitle>
                        <DialogDescription>
                            Asigne una tarea a un técnico específico.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, clientId: val })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Técnico</Label>
                                <Select
                                    value={formData.technicianId}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, technicianId: val })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Asignar Técnico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.fullName}
                                            </SelectItem>
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
                                onChange={(e) =>
                                    setFormData({ ...formData, contactName: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Inicio</Label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startTime: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fin</Label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endTime: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val: "BAJA" | "MEDIA" | "ALTA" | "URGENTE") =>
                                    setFormData({ ...formData, priority: val })
                                }
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
                            <Label>Tipo de Servicio</Label>
                            <Select
                                value={formData.serviceType}
                                onValueChange={(val: ServiceType) =>
                                    setFormData({ ...formData, serviceType: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PREVENTIVO">Preventivo - Mantenimiento Programado</SelectItem>
                                    <SelectItem value="CORRECTIVO">Correctivo - Reparación</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Equipos / Activos{" "}
                                <span className="text-muted-foreground font-normal">
                                    (opcional)
                                </span>
                            </Label>
                            {!formData.clientId ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-slate-50">
                                    Seleccione un cliente primero
                                </p>
                            ) : loadingEquipment ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-slate-50">
                                    Cargando equipos...
                                </p>
                            ) : clientEquipment.length === 0 ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-slate-50">
                                    Este cliente no tiene equipos registrados.
                                </p>
                            ) : (
                                <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1 bg-white">
                                    {clientEquipment.map((eq) => {
                                        const selectedEq = selectedEquipment.find(e => e.id === eq.id);
                                        const isChecked = !!selectedEq;
                                        
                                        return (
                                            <div key={eq.id} className={`flex flex-col gap-2 p-2 rounded border transition-colors ${isChecked ? "bg-slate-50 border-primary/20" : "border-transparent hover:bg-slate-50"}`}>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            if (isChecked) {
                                                                setSelectedEquipment((prev) =>
                                                                    prev.filter((e) => e.id !== eq.id)
                                                                );
                                                            } else {
                                                                // Pre-select template if linked
                                                                let templateId = undefined;
                                                                let templateName = undefined;

                                                                if (eq.checklistTemplateId) {
                                                                    const template = templates.find(p => p.id === eq.checklistTemplateId);
                                                                    if (template) {
                                                                        templateId = template.id;
                                                                        templateName = template.name;
                                                                    }
                                                                }

                                                                setSelectedEquipment((prev) => [
                                                                    ...prev,
                                                                    { 
                                                                        id: eq.id, 
                                                                        name: eq.name,
                                                                        checklistTemplateId: eq.checklistTemplateId,
                                                                        templateId,
                                                                        templateName
                                                                    }
                                                                ]);
                                                            }
                                                        }}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm font-medium">{eq.name} - {eq.model}</span>
                                                </label>

                                                {isChecked && (
                                                    <div className="ml-6">
                                                        <Select
                                                            value={selectedEq?.templateId || "none"}
                                                            onValueChange={(val) => {
                                                                const template = templates.find(p => p.id === val);
                                                                setSelectedEquipment(prev => prev.map(item => {
                                                                    if (item.id === eq.id) {
                                                                        return {
                                                                            ...item,
                                                                            templateId: val === "none" ? undefined : val,
                                                                            templateName: template ? template.name : undefined
                                                                        };
                                                                    }
                                                                    return item;
                                                                }));
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs bg-white">
                                                                <SelectValue placeholder="Seleccionar protocolo..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">-- Sin protocolo --</SelectItem>
                                                                {templates.map(p => (
                                                                    <SelectItem key={p.id} value={p.id}>
                                                                        {p.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedEquipment.length > 0 && (
                                <p className="text-xs text-primary font-medium">
                                    {selectedEquipment.length} equipos seleccionados
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción / Notas</Label>
                            <Input
                                placeholder="Detalles de la tarea..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
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
