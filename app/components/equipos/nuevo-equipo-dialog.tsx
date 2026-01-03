import { useState } from "react";
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
import { Plus, Calendar } from "lucide-react";
import { createEquipo } from "~/lib/firestore";

export function NuevoEquipoDialog({ clienteId }: { clienteId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        modelo: "",
        serie: "",
        estado: "activo",
        ultimo_mantenimiento: new Date().toISOString().split("T")[0],
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
                ultimo_mantenimiento: new Date().toISOString().split("T")[0],
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
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Información del Equipo
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="eq-nombre">Nombre</Label>
                                <Input
                                    id="eq-nombre"
                                    placeholder="Ej: Aire Acondicionado"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
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
                                        onChange={(e) =>
                                            setFormData({ ...formData, modelo: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-serie">Serie</Label>
                                    <Input
                                        id="eq-serie"
                                        placeholder="SN-123456"
                                        required
                                        value={formData.serie}
                                        onChange={(e) =>
                                            setFormData({ ...formData, serie: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Estado y Mantenimiento
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="eq-estado">Estado</Label>
                                    <select
                                        id="eq-estado"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.estado}
                                        onChange={(e) =>
                                            setFormData({ ...formData, estado: e.target.value })
                                        }
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
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    ultimo_mantenimiento: e.target.value,
                                                })
                                            }
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
