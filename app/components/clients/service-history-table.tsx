import { useNavigate } from "react-router";
import { Wrench, ClipboardList, Play, CheckCircle } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Spinner } from "~/components/ui/spinner";
import { StatusBadge } from "~/components/ui/status-badge";
import { PriorityBadge } from "~/components/ui/priority-badge";
import { updateServiceStatus, type Task } from "~/lib/services";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ServiceHistoryTableProps {
    services: Task[];
    loading: boolean;
}

/**
 * Table component displaying service history for a client.
 * Includes action buttons to change service status.
 */
export function ServiceHistoryTable({ services, loading }: ServiceHistoryTableProps) {
    const navigate = useNavigate();

    if (services.length === 0 && !loading) {
        return (
            <>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            Historial de Servicios
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Revise el historial de mantenimiento de su cliente
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="gap-1.5 bg-[#0069B4] hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 h-9"
                        onClick={() => navigate("/services")}
                    >
                        <Play className="h-3.5 w-3.5" />
                        Nuevo Servicio
                    </Button>
                </div>
                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                        <div className="h-14 w-14 rounded-full bg-slate-100/80 flex items-center justify-center mb-4">
                            <ClipboardList className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">
                            No hay servicios registrados
                        </h3>
                        <p className="text-sm text-slate-500 mb-1">
                            Comience programando el primer servicio
                        </p>
                        <p className="text-sm text-slate-500 mb-1">para este cliente.</p>
                        <p className="text-xs text-[#0069B4] font-medium mb-5">
                            Puede gestionar mantenimientos y servicios desde aquí
                            <br />
                            centralizadamente.
                        </p>
                        <Button
                            size="sm"
                            className="gap-1.5 bg-[#0069B4] hover:bg-[#005a9e] shadow-sm h-9"
                            onClick={() => navigate("/services")}
                        >
                            <Play className="h-3.5 w-3.5" />
                            Programar Primer Servicio
                        </Button>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Historial de Servicios
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Revise el historial de mantenimiento de su cliente
                    </p>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 bg-[#0069B4] hover:bg-[#005a9e] shadow-sm transition-all active:scale-95 h-9"
                    onClick={() => navigate("/services")}
                >
                    <Play className="h-3.5 w-3.5" />
                    Nuevo Servicio
                </Button>
            </div>
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-200/60">
                                <TableHead className="w-[130px] font-bold text-slate-600 text-xs uppercase tracking-wider py-3">
                                    Fecha
                                </TableHead>
                                <TableHead className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3 bg-slate-50/50">
                                    Descripción
                                </TableHead>
                                <TableHead className="w-[120px] font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3 text-center bg-slate-50/50">
                                    Estado
                                </TableHead>
                                <TableHead className="w-[100px] font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3 text-center bg-slate-50/50">
                                    Prioridad
                                </TableHead>
                                <TableHead className="w-[110px] font-semibold text-slate-500 text-[11px] uppercase tracking-wider py-3 text-center bg-slate-50/50">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Spinner className="h-6 w-6 mx-auto text-[#0069B4]" />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow
                                        key={service.id}
                                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-200 border-b border-slate-100/80 group"
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {service.createAt
                                                        ? format(
                                                              new Date(service.createAt as Date),
                                                              "dd MMM yyyy",
                                                              { locale: es }
                                                          )
                                                        : "N/A"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {service.scheduledTime || "Sin hora"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {service.description || "Sin descripción"}
                                                </span>
                                                {service.equipment && service.equipment.length > 0 ? (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Wrench className="h-3 w-3" />
                                                        {service.equipment.map((e) => e.name).join(", ")}
                                                    </span>
                                                ) : (
                                                    service.equipmentSummary && (
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Wrench className="h-3 w-3" />
                                                            {service.equipmentSummary}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <StatusBadge status={service.status} />
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <PriorityBadge priority={service.priority} />
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            {service.status === "PENDIENTE" ? (
                                                <button
                                                    onClick={() =>
                                                        updateServiceStatus(service.id, "EN_PROGRESO")
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Iniciar
                                                </button>
                                            ) : service.status === "EN_PROGRESO" ? (
                                                <button
                                                    onClick={() =>
                                                        updateServiceStatus(service.id, "COMPLETADO")
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                                                >
                                                    <CheckCircle className="h-3 w-3" />
                                                    Finalizar
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
