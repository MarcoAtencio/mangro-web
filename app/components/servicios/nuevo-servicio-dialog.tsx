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
import { createService, type Task } from "~/lib/services";
import { subscribeToEquipos, type Equipo, type Usuario, type Cliente } from "~/lib/firestore";

interface NuevoServicioDialogProps {
    tecnicos: Usuario[];
    clientes: Cliente[];
    onSuccess?: () => void;
}

export function NuevoServicioDialog({ tecnicos, clientes, onSuccess }: NuevoServicioDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clientEquipment, setClientEquipment] = useState<Equipo[]>([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);

    // Track selected equipment (multiple selection)
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        clientId: "",
        technicianId: "",
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        startTime: "09:00",
        endTime: "10:00",
        priority: "MEDIA" as Task["priority"],
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
        const unsubscribe = subscribeToEquipos(formData.clientId, (equipos) => {
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
            const client = clientes.find((c) => c.id === formData.clientId);
            const tecnico = tecnicos.find((t) => t.id === formData.technicianId);

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
                equipment: selectedEquipment.join(", "), // Join multiple equipment as comma-separated string
            });

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
                            Asigna una tarea a un técnico específico.
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
                                        {clientes.map((c) => (
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
                                        {tecnicos.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.full_name}
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
                            <Label>
                                Equipos / Activos{" "}
                                <span className="text-muted-foreground font-normal">
                                    (opcional)
                                </span>
                            </Label>
                            {!formData.clientId ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-slate-50">
                                    Primero seleccione un cliente
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
                                        const equipmentLabel = `${eq.nombre} - ${eq.modelo}`;
                                        const isChecked =
                                            selectedEquipment.includes(equipmentLabel);
                                        return (
                                            <label
                                                key={eq.id}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50 transition-colors ${isChecked ? "bg-primary/5" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            setSelectedEquipment((prev) =>
                                                                prev.filter(
                                                                    (e) => e !== equipmentLabel
                                                                )
                                                            );
                                                        } else {
                                                            setSelectedEquipment((prev) => [
                                                                ...prev,
                                                                equipmentLabel,
                                                            ]);
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">{equipmentLabel}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedEquipment.length > 0 && (
                                <p className="text-xs text-primary font-medium">
                                    {selectedEquipment.length} equipo(s) seleccionado(s)
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
