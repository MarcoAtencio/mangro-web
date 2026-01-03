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
import { Pencil, Trash2, Calendar } from "lucide-react";
import { updateEquipo, deleteEquipo, type Equipo } from "~/lib/firestore";

export function EditarEquipoDialog({ clienteId, equipo }: { clienteId: string; equipo: Equipo }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: equipo.nombre,
        modelo: equipo.modelo,
        serie: equipo.serie,
        estado: equipo.estado,
        ultimo_mantenimiento: equipo.ultimo_mantenimiento
            ? equipo.ultimo_mantenimiento instanceof Date
                ? equipo.ultimo_mantenimiento.toISOString().split("T")[0]
                : (equipo.ultimo_mantenimiento as any).toDate().toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
    });

    // Update form data when equipment or open state changes
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                nombre: equipo.nombre,
                modelo: equipo.modelo,
                serie: equipo.serie,
                estado: equipo.estado,
                ultimo_mantenimiento: equipo.ultimo_mantenimiento
                    ? equipo.ultimo_mantenimiento instanceof Date
                        ? equipo.ultimo_mantenimiento.toISOString().split("T")[0]
                        : new Date(equipo.ultimo_mantenimiento as any).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-100 rounded-full"
                >
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
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Información del Equipo
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-eq-nombre">Nombre</Label>
                                <Input
                                    id="edit-eq-nombre"
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
                                    <Label htmlFor="edit-eq-modelo">Modelo</Label>
                                    <Input
                                        id="edit-eq-modelo"
                                        placeholder="Modelo XYZ"
                                        required
                                        value={formData.modelo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, modelo: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-eq-serie">Serie</Label>
                                    <Input
                                        id="edit-eq-serie"
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
                                    <Label htmlFor="edit-eq-estado">Estado</Label>
                                    <select
                                        id="edit-eq-estado"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        value={formData.estado}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estado: e.target.value as any,
                                            })
                                        }
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

                    {showDeleteConfirm && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                            <strong>¿Eliminar equipo?</strong> Confirme si realmente desea eliminar
                            este equipo.
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                        <Button
                            type="button"
                            variant={showDeleteConfirm ? "destructive" : "outline"}
                            className={
                                showDeleteConfirm
                                    ? ""
                                    : "text-red-600 border-red-200 hover:bg-red-50"
                            }
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {showDeleteConfirm ? "Confirmar" : "Eliminar"}
                        </Button>
                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setOpen(false);
                                    setShowDeleteConfirm(false);
                                }}
                            >
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
