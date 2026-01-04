import type { MetaFunction } from "react-router";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Servicios | MANGRO Admin" },
        { name: "description", content: "Administra y programa servicios técnicos de mantenimiento." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Clock,
    Search,
    User,
    Briefcase,
    CheckCircle2,
    Loader2,
    Filter,
    X,
} from "lucide-react";

import { useServices } from "~/hooks/use-services";
import { useUsuarios } from "~/hooks/use-usuarios";
import { useClientes } from "~/hooks/use-clientes";
import { usePagination } from "~/hooks/use-pagination";
import type { Task } from "~/lib/services";

import { NuevoServicioDialog } from "~/components/servicios/nuevo-servicio-dialog";
import { DetalleServicioDialog } from "~/components/servicios/detalle-servicio-dialog";
// New Component
import { ServicesTable } from "~/components/servicios/services-table";
import { StatsCard } from "~/components/ui/stats-card";
import { PaginationControls } from "~/components/ui/pagination-controls";

export default function ServiciosPage() {
    // Data Hooks
    const { services, loading: loadingServices } = useServices();
    const { usuarios: allUsers } = useUsuarios();
    const { clientes } = useClientes();

    // Derived Data
    const tecnicos = allUsers.filter((u) => u.role === "TECNICO");
    
    // UI State
    const [selectedService, setSelectedService] = useState<Task | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTechnician, setFilterTechnician] = useState<string>("all");
    const [filterClient, setFilterClient] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Stats
    const stats = {
        pendiente: services.filter((s) => s.status === "PENDIENTE").length,
        enProgreso: services.filter((s) => s.status === "EN_PROGRESO").length,
        completado: services.filter((s) => s.status === "COMPLETADO").length,
        total: services.length,
    };

    // Filtering Logic
    const filteredServices = services.filter((service) => {
        const technicianName = tecnicos.find((t) => t.id === service.technicianId)?.full_name || "";

        // Search
        const matchesSearch =
            searchQuery === "" ||
            service.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.equipmentSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            technicianName.toLowerCase().includes(searchQuery.toLowerCase());

        // Filters
        const matchesTechnician = filterTechnician === "all" || service.technicianId === filterTechnician;
        const matchesClient = filterClient === "all" || service.clientName === filterClient;
        const matchesStatus = filterStatus === "all" || service.status === filterStatus;

        return matchesSearch && matchesTechnician && matchesClient && matchesStatus;
    });

    // Pagination Hook
    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        setPage,
        itemsPerPage
    } = usePagination({
        totalItems: filteredServices.length,
        itemsPerPage: 10,
        initialPage: 1
    });

    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    // Helper handlers
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1);
    };

    const handleFilterChange = (setter: (val: string) => void, val: string) => {
        setter(val);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilterTechnician("all");
        setFilterClient("all");
        setFilterStatus("all");
        setPage(1);
    };

    const hasActiveFilters =
        searchQuery !== "" ||
        filterTechnician !== "all" ||
        filterClient !== "all" ||
        filterStatus !== "all";

    return (
        <AdminLayout 
            title="Gestión de Servicios"
            subtitle="Administra y programa servicios técnicos de mantenimiento"
            headerActions={<NuevoServicioDialog tecnicos={tecnicos} clientes={clientes} />}
        >
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                    <StatsCard 
                        title="Total" 
                        value={stats.total} 
                        icon={Briefcase}
                        active={filterStatus === "all"}
                        onClick={() => handleFilterChange(setFilterStatus, "all")}
                    />
                    <StatsCard 
                        title="Pendientes" 
                        value={stats.pendiente} 
                        icon={Clock} 
                        variant="amber"
                        active={filterStatus === "PENDIENTE"}
                        onClick={() => handleFilterChange(setFilterStatus, filterStatus === "PENDIENTE" ? "all" : "PENDIENTE")}
                    />
                    <StatsCard 
                        title="En Progreso" 
                        value={stats.enProgreso} 
                        icon={Loader2} 
                        variant="blue"
                        active={filterStatus === "EN_PROGRESO"}
                        onClick={() => handleFilterChange(setFilterStatus, filterStatus === "EN_PROGRESO" ? "all" : "EN_PROGRESO")}
                    />
                    <StatsCard 
                        title="Completados" 
                        value={stats.completado} 
                        icon={CheckCircle2} 
                        variant="green"
                        active={filterStatus === "COMPLETADO"}
                        onClick={() => handleFilterChange(setFilterStatus, filterStatus === "COMPLETADO" ? "all" : "COMPLETADO")}
                    />
                </div>

                {/* Filters Section */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Search Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        {/* Search - Left side */}
                        <div className="relative w-full sm:w-64 lg:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente, descripción o técnico..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9 h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                            {/* Technician Filter */}
                            <Select
                                value={filterTechnician}
                                onValueChange={(val) => handleFilterChange(setFilterTechnician, val)}
                            >
                                <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Técnico" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los técnicos</SelectItem>
                                {tecnicos.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Client Filter */}
                        <Select
                            value={filterClient}
                            onValueChange={(val) => handleFilterChange(setFilterClient, val)}
                        >
                            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Cliente" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los clientes</SelectItem>
                                {clientes.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select
                            value={filterStatus}
                            onValueChange={(val) => handleFilterChange(setFilterStatus, val)}
                        >
                            <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36 lg:w-40 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Estado" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                                <SelectItem value="COMPLETADO">Completado</SelectItem>
                                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 px-2 gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                                Limpiar
                            </Button>
                        )}
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="gap-1">
                            <Filter className="h-3 w-3" />
                            {filteredServices.length} resultado{filteredServices.length !== 1 ? "s" : ""}
                        </Badge>
                    </div>
                )}

                {/* Table - With gray background section syncing with Clientes design */}
                <div className="flex flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 md:py-5 lg:py-6 pb-6 lg:pb-8 bg-slate-100/70 flex-1 -mb-4 md:-mb-6 lg:-mb-8 border-t border-slate-200">
                    <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex-1 flex flex-col">
                            <ServicesTable 
                                services={paginatedServices}
                                tecnicos={tecnicos}
                                loading={loadingServices}
                                onSelectService={(service) => {
                                    setSelectedService(service);
                                    setDetailOpen(true);
                                }}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredServices.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setPage}
                                isEmpty={services.length === 0}
                                isFiltered={filteredServices.length === 0 && services.length > 0}
                            />
                        </div>

                        {/* Pagination syncing with Clientes design */}
                        {!loadingServices && filteredServices.length > 0 && (
                            <div className="mt-6">
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={filteredServices.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setPage}
                                    itemName="servicios"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DetalleServicioDialog
                service={selectedService}
                tecnico={tecnicos.find((t) => t.id === selectedService?.technicianId)}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </AdminLayout>
    );
}
