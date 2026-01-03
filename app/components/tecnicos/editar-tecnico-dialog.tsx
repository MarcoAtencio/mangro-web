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
} from "~/components/ui/dialog";
import { updateUsuario, type Usuario } from "~/lib/firestore";
import { uploadProfileImage } from "~/lib/storage";

interface EditarTecnicoDialogProps {
    usuario: Usuario;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditarTecnicoDialog({
    usuario,
    open,
    onOpenChange,
    onSuccess,
}: EditarTecnicoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        full_name: usuario.full_name || "",
        phone: usuario.phone || "",
        role: usuario.role || "TECNICO",
    });

    useEffect(() => {
        setFormData({
            full_name: usuario.full_name || "",
            phone: usuario.phone || "",
            role: usuario.role || "TECNICO",
        });
        setSelectedFile(null);
    }, [usuario]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let photoUrl = usuario.photo_url;
            if (selectedFile) {
                photoUrl = await uploadProfileImage(selectedFile, usuario.id);
            }

            await updateUsuario(usuario.id, {
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role as any,
                photo_url: photoUrl,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Técnico</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del usuario. El email no se puede cambiar aquí.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_photo">Foto de Perfil</Label>
                            <div className="flex items-center gap-4">
                                {usuario.photo_url && !selectedFile && (
                                    <img
                                        src={usuario.photo_url}
                                        alt="Current"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                )}
                                <Input
                                    id="edit_photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                                id="edit_email"
                                value={usuario.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_full_name">Nombre Completo</Label>
                            <Input
                                id="edit_full_name"
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, full_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_phone">Teléfono</Label>
                            <Input
                                id="edit_phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_role">Rol</Label>
                            <select
                                id="edit_role"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value as any })
                                }
                            >
                                <option value="TECNICO">Técnico</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
