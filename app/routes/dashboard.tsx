import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";

export const meta: MetaFunction = () => {
    return [
        { title: "Dashboard | MANGRO Admin" },
        { name: "description", content: "Panel de administración principal de MANGRO S.A.C." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { StatsCard } from "~/components/ui/stats-card";
import { StatusBadge } from "~/components/ui/status-badge";
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
import { useDashboardStats } from "~/hooks/use-dashboard-stats";

export default function DashboardPage() {
    const navigate = useNavigate();
    const { stats, recentServices, technicians, loading } = useDashboardStats();

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
        <AdminLayout 
            title="Dashboard" 
            subtitle="Resumen general de operaciones y métricas clave"
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Informes de Hoy"
                        value={stats.sc_informesHoy}
                        description={`${stats.sc_informesPendientes} pendientes de revisión`}
                        icon={FileText}
                        // trend={{ value: 12, label: "vs ayer", positive: true }} // TODO: Implement real trend calculation
                    />
                    <StatsCard
                        title="Técnicos Activos"
                        value={stats.sc_tecnicosActivos}
                        description={`${stats.sc_tecnicosTotal} registrados`}
                        icon={Users}
                        variant="green"
                    />
                    <StatsCard
                        title="Clientes Totales"
                        value={stats.sc_clientesTotal}
                        icon={Building2}
                        variant="secondary"
                    />
                    <StatsCard
                        title="Equipos Registrados"
                        value={stats.sc_equiposTotal} // Currently 0 based on hook limitation
                        description="Con historial de mantenimiento"
                        icon={CheckCircle2}
                        variant="amber"
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
                                    <CardDescription>
                                        Últimas tareas completadas o en revisión
                                    </CardDescription>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="hidden sm:flex h-8"
                                    onClick={() => navigate("/servicios")}
                                >
                                    Ver todos
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pb-0">
                            <div className="overflow-x-auto overflow-y-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="min-w-[150px]">Cliente</TableHead>
                                            <TableHead className="hidden md:table-cell min-w-[200px]">
                                                Equipo
                                            </TableHead>
                                            <TableHead className="hidden sm:table-cell min-w-[120px]">
                                                Técnico
                                            </TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentServices.length > 0 ? (
                                            recentServices.map((service) => (
                                                <TableRow
                                                    key={service.id}
                                                    className="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <TableCell className="font-medium">
                                                        {service.clientName}
                                                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                                                            {service.equipmentSummary}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                                        {service.equipmentSummary}
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                        {technicians.find(t => t.id === service.technicianId)?.full_name || "Sin asignar"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <StatusBadge status={service.status} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No hay servicios recientes
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Card - Still Mocked for visual structure until we have advanced analytics */}
                    <Card className="shadow-md border-slate-200">
                        <CardHeader>
                            <CardTitle>Resumen Mensual</CardTitle>
                            <CardDescription>Rendimiento del mes actual</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">
                                        Cumplimiento de Metas
                                    </span>
                                    <span className="font-bold text-primary">--%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-[0%] rounded-full shadow-sm" />
                                </div>
                                <p className="text-xs text-muted-foreground text-right italic">Datos insuficientes</p>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-green-700/70 font-medium">
                                            Incremento mensual
                                        </span>
                                        <span className="text-sm font-bold text-green-700">
                                            -- servicios
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-amber-700/70 font-medium">
                                            Tiempo promedio
                                        </span>
                                        <span className="text-sm font-bold text-amber-700">
                                            -- hrs / tarea
                                        </span>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 cursor-pointer hover:bg-blue-100/50 transition-colors group"
                                    onClick={() => navigate("/servicios?status=PENDIENTE")}
                                >
                                    <AlertCircle className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-blue-700/70 font-medium">
                                            Tareas por revisar
                                        </span>
                                        <span className="text-sm font-bold text-blue-700">
                                            {stats.sc_informesPendientes} pendientes
                                        </span>
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
