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
import { Plus } from "lucide-react";
import { useAuth } from "~/lib/auth";
import { uploadProfileImage } from "~/lib/storage";
import { createUsuario } from "~/lib/firestore";

export function NuevoTecnicoDialog({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { registerUser } = useAuth();
    const [formData, setFormData] = useState<{
        full_name: string;
        email: string;
        phone: string;
        password: string;
        role: "ADMIN" | "TECNICO" | "SUPERVISOR";
    }>({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "TECNICO",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create user in Firebase Auth (getting the UID)
            const uid = await registerUser(formData.email, formData.password);

            // 2. Upload photo if selected
            let photoUrl = "";
            if (selectedFile) {
                try {
                    photoUrl = await uploadProfileImage(selectedFile, uid);
                } catch (uploadError) {
                    console.error("Failed to upload photo:", uploadError);
                }
            }

            // 3. Create user document in Firestore with the same UID
            await createUsuario(
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    photo_url: photoUrl,
                    created_at: new Date(),
                },
                uid
            );

            setOpen(false);

            setFormData({ full_name: "", email: "", phone: "", password: "", role: "TECNICO" });
            setSelectedFile(null);
            onSuccess?.();
        } catch (error) {
            console.error("Error creating user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">                    <Plus className="h-4 w-4" />
                    Nuevo Técnico
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Técnico</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del técnico para registrarlo en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="photo">Foto de Perfil</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setSelectedFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Nombre Completo</Label>
                            <Input
                                id="full_name"
                                placeholder="Juan Pérez García"
                                value={formData.full_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, full_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tecnico@mangro.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                placeholder="+51 999 999 999"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña Temporal</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Rol</Label>
                            <select
                                id="role"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value as "ADMIN" | "TECNICO" | "SUPERVISOR" })
                                }
                            >
                                <option value="TECNICO">Técnico</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner className="mr-2 h-4 w-4" />}
                            {loading ? "Guardando..." : "Registrar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
