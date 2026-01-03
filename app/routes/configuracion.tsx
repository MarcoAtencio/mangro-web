import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "~/lib/auth";
import { updateUsuario } from "~/lib/firestore";
import { uploadProfileImage } from "~/lib/storage";
import {
    UserCircle,
    Camera,
    Shield,
    Mail,
    Phone,
    Save,
} from "lucide-react";
export default function ConfiguracionPage() {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                full_name: userProfile.full_name || "",
                phone: userProfile.phone || "",
            });
        }
    }, [userProfile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userProfile) return;

        setLoading(true);
        setSuccessMessage("");

        try {
            let photoUrl = userProfile.photo_url;
            if (selectedFile) {
                photoUrl = await uploadProfileImage(selectedFile, user.uid);
            }

            await updateUsuario(user.uid, {
                full_name: formData.full_name,
                phone: formData.phone,
                photo_url: photoUrl,
            });

            setSuccessMessage("Perfil actualizado correctamente");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // Role Badge Logic (reused)
    const getRoleLabel = (role: string) => {
        switch (role) {
            case "ADMIN": return "Administrador";
            case "SUPERVISOR": return "Supervisor";
            case "TECNICO": return "Técnico";
            default: return role;
        }
    };

    return (
        <AdminLayout title="Configuración">
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="perfil" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
                        <TabsTrigger value="sistema">Sistema</TabsTrigger>
                    </TabsList>

                    <TabsContent value="perfil">
                        <div className="grid gap-6">
                            {/* Profile Header Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                        <div className="relative group">
                                            {previewUrl || userProfile?.photo_url ? (
                                                <img
                                                    src={previewUrl || userProfile?.photo_url}
                                                    alt="Avatar"
                                                    className="h-24 w-24 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-white sm:border-2 sm:border-primary/20 shadow-md"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 sm:h-20 sm:w-20 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-muted-foreground/30 shadow-inner">
                                                    <UserCircle className="h-12 w-12 sm:h-10 sm:w-10 text-muted-foreground" />
                                                </div>
                                            )}
                                            <label
                                                htmlFor="photo-upload"
                                                className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-primary/90 shadow-lg transition-transform active:scale-90"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </label>
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <CardTitle className="text-2xl font-bold tracking-tight">{userProfile?.full_name || "Usuario"}</CardTitle>
                                            <CardDescription className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                                <Shield className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-medium text-primary/80">{getRoleLabel(userProfile?.role || "TECNICO")}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Personal Info Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Datos Personales</CardTitle>
                                    <CardDescription>gestiona tu información pública y de contacto</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email (No editable)</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        value={user?.email || ""}
                                                        disabled
                                                        className="pl-9 bg-muted/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="full_name">Nombre Completo</Label>
                                                <Input
                                                    id="full_name"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    placeholder="Tu nombre completo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Teléfono</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+51 ..."
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            {successMessage && (
                                                <span className="text-green-600 text-sm font-medium animate-pulse flex items-center gap-2">
                                                    <Shield className="h-3 w-3" />
                                                    {successMessage}
                                                </span>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full md:w-auto ml-auto bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                            >
                                                {loading ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                                Guardar Cambios
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sistema">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferencias del Sistema</CardTitle>
                                <CardDescription>Personaliza tu experiencia en MANGRO</CardDescription>
                            </CardHeader>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                <p>Más opciones de configuración estarán disponibles pronto.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
