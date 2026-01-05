import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Settings | MANGRO Admin" },
        { name: "description", content: "System settings and profile preferences." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ClientSeeder } from "~/components/seeders/client-seeder";
import { ProtocolSeeder } from "~/components/seeders/protocol-seeder";
import { UserSeeder } from "~/components/seeders/user-seeder";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "~/lib/auth";
import { updateUser } from "~/lib/firestore";
import { uploadProfileImage } from "~/lib/storage";
import { UserCircle, Camera, Shield, Mail, Phone, Save } from "lucide-react";

export default function SettingsPage() {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || "",
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
            let photoUrl = userProfile.photoUrl;
            if (selectedFile) {
                photoUrl = await uploadProfileImage(selectedFile, user.uid);
            }

            await updateUser(user.uid, {
                fullName: formData.fullName,
                phone: formData.phone,
                photoUrl: photoUrl,
            });

            setSuccessMessage("Profile updated successfully");
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
            case "ADMIN":
                return "Administrador";
            case "SUPERVISOR":
                return "Supervisor";
            case "TECNICO":
            case "TECHNICIAN":
                return "Técnico";
            default:
                return role;
        }
    };

    return (
        <AdminLayout 
            title="Configuración" 
            subtitle="Administre su perfil personal y preferencias del sistema"
        >
            <div className="max-w-4xl mx-auto w-full">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
                        <TabsTrigger value="system">Sistema</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid gap-6">
                            {/* Profile Header Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                        <div className="relative group">
                                            {previewUrl || userProfile?.photoUrl ? (
                                                <img
                                                    src={previewUrl || userProfile?.photoUrl}
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
                                            <CardTitle className="text-2xl font-bold tracking-tight">
                                                {userProfile?.fullName || "Usuario"}
                                            </CardTitle>
                                            <CardDescription className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                                <Shield className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-medium text-primary/80">
                                                    {getRoleLabel(userProfile?.role || "TECHNICIAN")}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Personal Info Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>
                                        Administre su información pública y detalles de contacto
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Correo (Solo lectura)</Label>
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
                                                <Label htmlFor="fullName">Nombre Completo</Label>
                                                <Input
                                                    id="fullName"
                                                    value={formData.fullName}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            fullName: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Su nombre completo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Teléfono</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                phone: e.target.value,
                                                            })
                                                        }
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
                                                {loading ? (
                                                    <Spinner className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Guardar Cambios
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="system">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preferencias del Sistema</CardTitle>
                                    <CardDescription>
                                        Personalice su experiencia en MANGRO
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="theme">Modo Oscuro</Label>
                                        <div className="w-10 h-6 bg-slate-200 rounded-full cursor-not-allowed opacity-50"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notifications">Notificaciones por Correo</Label>
                                        <div className="w-10 h-6 bg-slate-200 rounded-full cursor-not-allowed opacity-50"></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex flex-col gap-4">
                                <ClientSeeder />
                                <ProtocolSeeder />
                                <UserSeeder />
                            </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
