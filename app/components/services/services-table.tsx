import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { PriorityBadge } from "~/components/ui/priority-badge";
import { StatusBadge } from "~/components/ui/status-badge";
import { Spinner } from "~/components/ui/spinner";
import { User } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Task } from "~/lib/services";
import type { User as UserType } from "~/lib/firestore";

interface ServicesTableProps {
    services: Task[];
    technicians: UserType[];
    loading: boolean;
    onSelectService: (service: Task) => void;
    
    // Pagination props
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    
    isEmpty: boolean; // True if no services at all
    isFiltered: boolean; // True if filters are applied
}

export function ServicesTable({
    services,
    technicians,
    loading,
    onSelectService,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    isEmpty,
}: ServicesTableProps) {
    
    const formatDate = (date: Date | undefined) => {
        if (!date) return "N/A";
        return new Intl.DateTimeFormat("es-PE", {
            weekday: "short",
            day: "numeric",
            month: "short",
        }).format(new Date(date));
    };

    /* Loading is handled at the page level with ServicesSkeleton */

    return (
        <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
            <TableHeader>
                <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[90px] sm:w-[120px]">Fecha</TableHead>
                    <TableHead className="min-w-[120px]">Cliente</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[150px]">Descripción</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">Técnico</TableHead>
                    <TableHead className="hidden lg:table-cell w-[80px]">Prioridad</TableHead>
                    <TableHead className="text-right sm:text-left w-[80px] sm:w-[100px]">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {services.length > 0 ? (
                    services.map((service) => (
                        <TableRow
                            key={service.id}
                            className="hover:bg-slate-50 cursor-pointer transition-all duration-300 hover:shadow-sm group"
                            onClick={() => onSelectService(service)}
                        >
                            <TableCell
                                className={cn(
                                    "font-medium border-l-4 transition-all duration-300 group-hover:pl-5",
                                    service.status === "COMPLETADO"
                                        ? "border-l-emerald-500"
                                        : service.status === "EN_PROGRESO"
                                            ? "border-l-blue-500"
                                            : service.status === "CANCELADO"
                                                ? "border-l-red-500"
                                                : "border-l-slate-400"
                                )}
                            >
                                <div className="flex flex-col">
                                    <span>{formatDate(service.date)}</span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {service.scheduledTime}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col max-w-[150px]">
                                    <span className="font-medium text-sm truncate">{service.clientName}</span>
                                    <span className="text-xs text-slate-500 font-medium truncate">{service.address}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col max-w-[180px] lg:max-w-[200px]">
                                    <span className="font-medium truncate">
                                        {service.equipmentSummary}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium truncate">
                                        {service.contactName}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">
                                        {technicians.find((t) => t.id === service.technicianId)?.fullName || "Sin asignar"}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <PriorityBadge priority={service.priority} />
                            </TableCell>
                            <TableCell className="text-right sm:text-left">
                                <StatusBadge status={service.status} />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                        >
                            {isEmpty
                                ? "No hay servicios programados"
                                : "No se encontraron servicios con los filtros seleccionados"}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        </div>
    );
}
