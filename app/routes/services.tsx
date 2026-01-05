import type { MetaFunction } from "react-router";
import { useState, lazy, Suspense } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Servicios y Mantenimiento | MANGRO Admin" },
        { name: "description", content: "Programe y gestione servicios de mantenimiento técnico, instalaciones y reparaciones." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
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
    Plus,
} from "lucide-react";

import { useServices } from "~/hooks/use-services";
import { useUsers } from "~/hooks/use-users";
import { useClients } from "~/hooks/use-clients";
import { usePagination } from "~/hooks/use-pagination";
import type { Task } from "~/lib/services";

// Lazy loading dialogs to reduce initial bundle size
const NewServiceDialog = lazy(() => import("~/components/services/new-service-dialog").then(m => ({ default: m.NewServiceDialog })));
const ServiceDetailDialog = lazy(() => import("~/components/services/service-detail-dialog").then(m => ({ default: m.ServiceDetailDialog })));

import { ServicesTable } from "~/components/services/services-table";
import { StatsCard } from "~/components/ui/stats-card";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { ServicesSkeleton } from "~/components/services/services-skeleton";

export default function ServicesPage() {
    // Data Hooks
    const { services, loading: loadingServices } = useServices();
    const { users: allUsers } = useUsers();
    const { clients } = useClients();

    // Derived Data
    const technicians = allUsers.filter((u) => u.role === "TECHNICIAN" || u.role === "TECNICO" as any);
    
    // UI State
    const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
    const [selectedService, setSelectedService] = useState<Task | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTechnician, setFilterTechnician] = useState<string>("all");
    const [filterClient, setFilterClient] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Stats
    const stats = {
        pending: services.filter((s) => s.status === "PENDIENTE").length,
        inProgress: services.filter((s) => s.status === "EN_PROGRESO").length,
        completed: services.filter((s) => s.status === "COMPLETADO").length,
        total: services.length,
    };

    // Filtering Logic
    const filteredServices = services.filter((service) => {
        const technicianName = technicians.find((t) => t.id === service.technicianId)?.fullName || "";

        // Search - support both new array format and legacy string
        const equipmentNames = service.equipment?.map(e => e.name).join(" ") || "";
        const matchesSearch =
            searchQuery === "" ||
            service.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            equipmentNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    if (loadingServices) {
        return <ServicesSkeleton />;
    }

    return (
        <AdminLayout 
            title="Gestión de Servicios"
            subtitle="Gestione y programe servicios de mantenimiento técnico"
            headerActions={
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setShowNewServiceDialog(true)}
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Servicio
                    </Button>
                    {showNewServiceDialog && (
                        <Suspense fallback={null}>
                            <NewServiceDialog 
                                technicians={technicians} 
                                clients={clients} 
                                open={true}
                                onOpenChange={setShowNewServiceDialog}
                            />
                        </Suspense>
                    )}
                </div>
            }
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
                        value={stats.pending} 
                        icon={Clock} 
                        variant="amber"
                        active={filterStatus === "PENDIENTE"}
                        onClick={() => handleFilterChange(setFilterStatus, filterStatus === "PENDIENTE" ? "all" : "PENDIENTE")}
                    />
                    <StatsCard 
                        title="En Progreso" 
                        value={stats.inProgress} 
                        icon={Loader2} 
                        variant="blue"
                        active={filterStatus === "EN_PROGRESO"}
                        onClick={() => handleFilterChange(setFilterStatus, filterStatus === "EN_PROGRESO" ? "all" : "EN_PROGRESO")}
                    />
                    <StatsCard 
                        title="Completados" 
                        value={stats.completed} 
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
                                aria-label="Buscar servicios por cliente, descripción o técnico"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                            {/* Technician Filter */}
                            <Select
                                value={filterTechnician}
                                onValueChange={(val) => handleFilterChange(setFilterTechnician, val)}
                            >
                             <SelectTrigger 
                                className="w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm"
                                aria-label="Filtrar por técnico"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Técnico" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los técnicos</SelectItem>
                                {technicians.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Client Filter */}
                        <Select
                            value={filterClient}
                            onValueChange={(val) => handleFilterChange(setFilterClient, val)}
                        >
                            <SelectTrigger 
                                className="w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm"
                                aria-label="Filtrar por cliente"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Cliente" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los clientes</SelectItem>
                                {clients.map((c) => (
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
                            <SelectTrigger 
                                className="w-[calc(50%-0.25rem)] sm:w-36 lg:w-40 h-9 bg-white border-slate-200 shadow-sm text-xs sm:text-sm"
                                aria-label="Filtrar por estado"
                            >
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
                                technicians={technicians}
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

            {detailOpen && (
                <Suspense fallback={null}>
                    <ServiceDetailDialog
                        service={selectedService}
                        technician={technicians.find((t) => t.id === selectedService?.technicianId)}
                        open={detailOpen}
                        onOpenChange={setDetailOpen}
                    />
                </Suspense>
            )}
        </AdminLayout>
    );
}
