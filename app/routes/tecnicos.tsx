import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
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
    Users,
    Plus,
    Search,
    Settings,
    Phone,
    Mail,
    Shield,
    UserCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
    subscribeToUsuarios,
    createUsuario,
    updateUsuario,
    formatFirestoreDate,
    type Usuario
} from "~/lib/firestore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { uploadProfileImage } from "~/lib/storage";
import { useAuth } from "~/lib/auth";

function getRoleBadge(role: string) {
    switch (role) {
        case "ADMIN":
            return <Badge variant="default" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
        case "TECNICO":
            return <Badge variant="success" className="gap-1"><Users className="h-3 w-3" />Técnico</Badge>;
        case "SUPERVISOR":
            return <Badge variant="warning" className="gap-1"><Shield className="h-3 w-3" />Supervisor</Badge>;
        default:
            return <Badge variant="outline">{role}</Badge>;
    }
}

function NuevoTecnicoDialog({ onSuccess }: { onSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { registerUser } = useAuth();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "TECNICO" as const,
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
                    // Continue without photo or handle error
                }
            }

            // 3. Create user document in Firestore with the same UID
            await createUsuario({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                photo_url: photoUrl,
                created_at: new Date(),
            }, uid);


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
                <Button className="gap-2 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-md transition-all active:scale-95">
                    <Plus className="h-4 w-4" />
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
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                placeholder="+51 999 999 999"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña Temporal</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
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
        </Dialog >
    );
}

function EditarTecnicoDialog({ usuario, open, onOpenChange, onSuccess }: {
    usuario: Usuario;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}) {
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
                                    <img src={usuario.photo_url} alt="Current" className="h-10 w-10 rounded-full object-cover" />
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
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_phone">Teléfono</Label>
                            <Input
                                id="edit_phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_role">Rol</Label>
                            <select
                                id="edit_role"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
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

export default function TecnicosPage() {
    const [search, setSearch] = useState("");
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    useEffect(() => {
        // Subscribe to real-time updates
        let unsubscribe: (() => void) | undefined;

        try {
            unsubscribe = subscribeToUsuarios(
                (data) => {
                    setUsuarios(data);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    console.error("Firestore error:", err);
                    setLoading(false);
                    if (err.code === 'permission-denied') {
                        setError("Permisos insuficientes. Necesitas iniciar sesión para ver los usuarios.");
                    } else {
                        setError("Error al cargar usuarios: " + err.message);
                    }
                }
            );
        } catch (err: any) {
            setLoading(false);
            setError("Error de conexión con Firebase");
        }

        return () => unsubscribe?.();
    }, []);

    const filteredUsuarios = usuarios.filter(
        (usuario) =>
            usuario.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            usuario.email?.toLowerCase().includes(search.toLowerCase()) ||
            usuario.role?.toLowerCase().includes(search.toLowerCase())
    );

    const tecnicos = filteredUsuarios.filter((u) => u.role === "TECNICO");
    const admins = filteredUsuarios.filter((u) => u.role === "ADMIN");
    const supervisores = filteredUsuarios.filter((u) => u.role === "SUPERVISOR");

    if (loading) {
        return (
            <AdminLayout title="Gestión de Técnicos">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <Spinner className="h-8 w-8 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Cargando usuarios...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Gestión de Técnicos">
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md">
                        <CardContent className="pt-6 text-center">
                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Acceso Restringido</h3>
                            <p className="text-muted-foreground text-sm mb-4">{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Reintentar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Gestión de Técnicos">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o rol..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white border-slate-200 focus:border-secondary transition-colors shadow-sm"
                        />
                    </div>
                    <NuevoTecnicoDialog />
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{usuarios.length}</p>
                                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{tecnicos.length}</p>
                                <p className="text-sm text-muted-foreground">Técnicos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{supervisores.length}</p>
                                <p className="text-sm text-muted-foreground">Supervisores</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 py-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{admins.length}</p>
                                <p className="text-sm text-muted-foreground">Administradores</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="border-slate-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Lista de Usuarios</CardTitle>
                        <CardDescription>
                            Gestiona los técnicos y usuarios del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="hidden sm:table-cell">Registro</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsuarios.map((usuario) => (
                                    <TableRow key={usuario.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {usuario.photo_url ? (
                                                    <img
                                                        src={usuario.photo_url}
                                                        alt={usuario.full_name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <UserCircle className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{usuario.full_name || "Sin nombre"}</p>
                                                    <p className="text-sm text-muted-foreground md:hidden">
                                                        {usuario.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {usuario.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {usuario.phone || <span className="text-muted-foreground/50 italic">Sin teléfono</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getRoleBadge(usuario.role)}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                            {formatFirestoreDate(usuario.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setEditingUser(usuario)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsuarios.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                {loading ? "Cargando usuarios..." : "No se encontraron usuarios"}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {editingUser && (
                <EditarTecnicoDialog
                    usuario={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                />
            )}
        </AdminLayout>
    );
}

