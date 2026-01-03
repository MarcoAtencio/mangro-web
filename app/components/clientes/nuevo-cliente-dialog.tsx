import { useState } from "react";
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
import { createCliente } from "~/lib/firestore";
import { Plus } from "lucide-react";

export function NuevoClienteDialog() {
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
        setFormData((prev) => ({ ...prev, address, lat, lng }));
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
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
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
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Información General
                            </h4>
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Razón Social</Label>
                                <Input
                                    id="nombre"
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
                                    <Label htmlFor="ruc">RUC</Label>
                                    <Input
                                        id="ruc"
                                        placeholder="20123456789"
                                        required
                                        value={formData.ruc}
                                        onChange={(e) =>
                                            setFormData({ ...formData, ruc: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono"
                                        placeholder="+51 1 234 5678"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Ubicación
                            </h4>
                            <AddressPicker
                                onAddressSelect={handleAddressSelect}
                                initialAddress={formData.address}
                            />
                        </div>

                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                                Contacto
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contacto">Contacto Principal</Label>
                                    <Input
                                        id="contacto"
                                        placeholder="Nombre del contacto"
                                        value={formData.contact_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                contact_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
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
