import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import {
    FileText,
    Users,
    Building2,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

// Mock data - Replace with Firestore queries
const mockStats = {
    informesHoy: 12,
    informesPendientes: 5,
    tecnicosActivos: 8,
    tecnicosTotal: 10,
    clientesTotal: 45,
    equiposTotal: 156,
};

const mockRecentReports = [
    {
        id: "1",
        cliente: "Empresa ABC S.A.",
        equipo: "Compresor Atlas Copco GA-500",
        tecnico: "Juan Pérez",
        fecha: "2026-01-02",
        estado: "completado",
    },
    {
        id: "2",
        cliente: "Industrias XYZ",
        equipo: "Bomba Hidráulica Parker",
        tecnico: "Carlos García",
        fecha: "2026-01-02",
        estado: "pendiente",
    },
    {
        id: "3",
        cliente: "Minera Norte",
        equipo: "Generador Caterpillar 3512",
        tecnico: "Luis Rodríguez",
        fecha: "2026-01-01",
        estado: "completado",
    },
    {
        id: "4",
        cliente: "Constructora Sur",
        equipo: "Excavadora Komatsu PC200",
        tecnico: "Miguel Torres",
        fecha: "2026-01-01",
        estado: "revision",
    },
];

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    trend?: { value: number; label: string };
    variant?: "default" | "success" | "warning" | "secondary";
}

function StatCard({ title, value, description, icon: Icon, trend, variant = "default" }: StatCardProps) {
    const iconColors = {
        default: "bg-primary/10 text-primary",
        success: "bg-green-500/10 text-green-600",
        warning: "bg-amber-500/10 text-amber-600",
        secondary: "bg-secondary/10 text-secondary",
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${iconColors[variant]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                            +{trend.value}% {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getStatusBadge(estado: string) {
    switch (estado) {
        case "completado":
            return <Badge variant="success">Completado</Badge>;
        case "pendiente":
            return <Badge variant="warning">Pendiente</Badge>;
        case "revision":
            return <Badge variant="secondary">En Revisión</Badge>;
        default:
            return <Badge variant="outline">{estado}</Badge>;
    }
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div className="flex items-center justify-center h-[60vh]">
                    <Spinner className="h-8 w-8 text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Informes de Hoy"
                        value={mockStats.informesHoy}
                        description={`${mockStats.informesPendientes} pendientes de revisión`}
                        icon={FileText}
                        trend={{ value: 12, label: "vs ayer" }}
                    />
                    <StatCard
                        title="Técnicos Activos"
                        value={mockStats.tecnicosActivos}
                        description={`${mockStats.tecnicosTotal} registrados`}
                        icon={Users}
                        variant="success"
                    />
                    <StatCard
                        title="Clientes Totales"
                        value={mockStats.clientesTotal}
                        icon={Building2}
                        trend={{ value: 8, label: "este mes" }}
                        variant="secondary"
                    />
                    <StatCard
                        title="Equipos Registrados"
                        value={mockStats.equiposTotal}
                        description="Con historial de mantenimiento"
                        icon={CheckCircle2}
                        variant="warning"
                    />
                </div>

                {/* Recent Reports */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Últimos Informes</CardTitle>
                                <CardDescription>
                                    Reportes técnicos recientes del equipo
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Actualizado hace 5 min
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockRecentReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{report.cliente}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {report.equipo}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium">{report.tecnico}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {report.fecha}
                                            </p>
                                        </div>
                                        {getStatusBadge(report.estado)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                        <CardContent className="flex items-center gap-4 py-6">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Gestionar Técnicos</p>
                                <p className="text-sm text-muted-foreground">
                                    Agregar o editar personal
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                        <CardContent className="flex items-center gap-4 py-6">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Ver Clientes</p>
                                <p className="text-sm text-muted-foreground">
                                    Catálogo de equipos
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                        <CardContent className="flex items-center gap-4 py-6">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Informes Pendientes</p>
                                <p className="text-sm text-muted-foreground">
                                    {mockStats.informesPendientes} por revisar
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
