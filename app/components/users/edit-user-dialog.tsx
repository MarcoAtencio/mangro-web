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
import { updateUser, type User } from "~/lib/firestore";
import { uploadProfileImage } from "~/lib/storage";
import { useAuth } from "~/lib/auth";
import { KeyRound, Mail, CheckCircle } from "lucide-react";

interface EditUserDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditUserDialog({
    user,
    open,
    onOpenChange,
    onSuccess,
}: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        phone: user.phone || "",
        role: user.role || "TECHNICIAN",
    });
    
    const { userProfile, sendPasswordResetEmail } = useAuth();
    const [resetSent, setResetSent] = useState(false);
    const isAdmin = userProfile?.role === "ADMIN";

    const [password, setPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        setFormData({
            fullName: user.fullName || "",
            phone: user.phone || "",
            role: user.role || "TECHNICIAN",
        });
        setSelectedFile(null);
        setPassword("");
        setResetSent(false); 
    }, [user]);

    const handleSetPassword = async () => {
        if (!password || password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (!confirm(`¿Cambiar la contraseña de ${user.email} manualmente?`)) return;

        setPasswordLoading(true);
        try {
            const formData = new FormData();
            formData.append("uid", user.id);
            formData.append("password", password);

            const res = await fetch("/api/admin/set-password", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al actualizar contraseña");
            }

            alert("Contraseña actualizada correctamente.");
            setPassword("");
        } catch (error: any) {
            console.error("Error setting password:", error);
            alert("Error: " + error.message);
        } finally {
            setPasswordLoading(false);
        }
    };


    const handlePasswordReset = async () => {
        if (!confirm(`¿Enviar correo de restablecimiento de contraseña a ${user.email}?`)) return;
        try {
            await sendPasswordResetEmail(user.email);
            setResetSent(true);
        } catch (error) {
            console.error("Error sending reset email:", error);
            alert("Error al enviar el correo.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let photoUrl = user.photoUrl;
            if (selectedFile) {
                photoUrl = await uploadProfileImage(selectedFile, user.id);
            }

            await updateUser(user.id, {
                fullName: formData.fullName,
                phone: formData.phone,
                role: formData.role as any,
                photoUrl: photoUrl,
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
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Modifique los detalles del usuario. El correo electrónico no se puede cambiar aquí.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_photo">Foto de Perfil</Label>
                            <div className="flex items-center gap-4">
                                {user.photoUrl && !selectedFile && (
                                    <img
                                        src={user.photoUrl}
                                        alt="Actual"
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
                            <Label htmlFor="edit_email">Correo Electrónico</Label>
                            <Input
                                id="edit_email"
                                value={user.email}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_fullName">Nombre Completo</Label>
                            <Input
                                id="edit_fullName"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
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
                                <option value="TECHNICIAN">Técnico</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                        
                        {isAdmin && (
                            <div className="pt-2 border-t mt-2">
                                <Label className="mb-2 block text-amber-700">Zona de Administración (Solo Admin)</Label>
                                <div className="bg-slate-50 p-3 rounded-md border text-sm">
                                    <div className="grid gap-2">
                                        <Label htmlFor="manual_password">Establecer nueva contraseña</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="manual_password" 
                                                type="text" 
                                                placeholder="Nueva contraseña" 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-8 text-xs font-mono"
                                            />
                                            <Button 
                                                type="button" 
                                                size="sm" 
                                                variant="secondary"
                                                onClick={handleSetPassword}
                                                disabled={!password || passwordLoading}
                                                className="h-8 whitespace-nowrap"
                                            >
                                                {passwordLoading ? <Spinner className="h-3 w-3" /> : (
                                                    <>
                                                        <KeyRound className="mr-2 h-3 w-3" />
                                                        Cambiar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Esta acción cambiará inmediatamente la contraseña del usuario. 
                                        El usuario deberá usar esta nueva contraseña para ingresar.
                                    </p>
                                </div>
                            </div>
                        )}
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
