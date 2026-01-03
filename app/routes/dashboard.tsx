import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

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

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Reports Table */}
                    <Card className="shadow-md border-slate-200 lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Servicios Recientes</CardTitle>
                                    <CardDescription>Últimas tareas completadas o en revisión</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="hidden sm:flex h-8">Ver todos</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pb-0">
                            <div className="overflow-x-auto overflow-y-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="min-w-[150px]">Cliente</TableHead>
                                            <TableHead className="hidden md:table-cell min-w-[200px]">Equipo</TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[120px]">Técnico</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockRecentReports.map((report) => (
                                            <TableRow key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">{report.cliente}</TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">{report.equipo}</TableCell>
                                                <TableCell className="hidden sm:table-cell text-muted-foreground">{report.tecnico}</TableCell>
                                                <TableCell className="text-right">
                                                    {getStatusBadge(report.estado)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Card */}
                    <Card className="shadow-md border-slate-200">
                        <CardHeader>
                            <CardTitle>Resumen Mensual</CardTitle>
                            <CardDescription>Rendimiento del mes actual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Cumplimiento de Metas</span>
                                    <span className="font-bold text-primary">85%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-[85%] rounded-full shadow-sm" />
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-green-700/70 font-medium">Incremento mensual</span>
                                        <span className="text-sm font-bold text-green-700">+15% servicios</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-amber-700/70 font-medium">Tiempo promedio</span>
                                        <span className="text-sm font-bold text-amber-700">1.8 hrs / tarea</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 cursor-pointer hover:bg-blue-100/50 transition-colors group">
                                    <AlertCircle className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-blue-700/70 font-medium">Tareas por revisar</span>
                                        <span className="text-sm font-bold text-blue-700">{mockStats.informesPendientes} pendientes</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
