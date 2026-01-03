import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { AddressPicker } from "~/components/ui/address-picker";
import { updateCliente, deleteCliente, type Cliente } from "~/lib/firestore";
import { Settings, Trash2 } from "lucide-react";

export function EditarClienteDialog({
    cliente,
    trigger,
}: {
    cliente: Cliente;
    trigger?: React.ReactNode;
}) {
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
        setFormData((prev) => ({ ...prev, address, lat, lng }));
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
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
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
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Información General
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombre">Razón Social</Label>
                                <Input
                                    id="edit-nombre"
                                    placeholder="Empresa S.A.C."
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
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
                                        onChange={(e) =>
                                            setFormData({ ...formData, ruc: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-telefono">Teléfono</Label>
                                    <Input
                                        id="edit-telefono"
                                        placeholder="+51 1 234 5678"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Ubicación */}
                        <div className="grid gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Ubicación
                            </h4>
                            <AddressPicker
                                onAddressSelect={handleAddressSelect}
                                initialAddress={formData.address}
                            />
                        </div>

                        {/* Section: Contacto */}
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Contacto
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-contacto">Contacto Principal</Label>
                                <Input
                                    id="edit-contacto"
                                    placeholder="Nombre del contacto"
                                    value={formData.contact_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contact_name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    placeholder="email@empresa.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {showDeleteConfirm && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                            <strong>¿Confirmar eliminación?</strong> Esta acción no se puede
                            deshacer y borrará toda la información del cliente.
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
                            {showDeleteConfirm ? "Confirmar Eliminación" : "Eliminar Cliente"}
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
