import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Client Management | MANGRO Admin" },
        { name: "description", content: "Manage client portfolio and industrial equipment." },
    ];
};
import { AdminLayout } from "~/components/layout/admin-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
    Building2,
    Search,
    Settings,
    Wrench,
    Filter,
    ArrowUpDown,
} from "lucide-react";

import { useClients } from "~/hooks/use-clients";
import { usePagination } from "~/hooks/use-pagination";
import { subscribeToEquipment, type Equipment } from "~/lib/firestore";
import { subscribeToServices } from "~/lib/services"; 

import { NewClientDialog } from "~/components/clients/new-client-dialog";
import { ClientRow } from "~/components/clients/client-row";
import { ClientCardMobile } from "~/components/clients/client-card-mobile";
import { StatsCard } from "~/components/ui/stats-card";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { ClientsSkeleton } from "~/components/clients/clients-skeleton";

export default function ClientsPage() {
    const { clients, loading: loadingClients } = useClients();
    const [search, setSearch] = useState("");
    
    // Equipment stats state
    const [equipmentStats, setEquipmentStats] = useState<{
        total: number;
        inMaintenance: number;
    }>({ total: 0, inMaintenance: 0 });

    const [servicesByClient, setServicesByClient] = useState<Record<string, number>>({});
    const [totalServices, setTotalServices] = useState(0);

    // Filter state
    const [statsFilter, setStatsFilter] = useState<
        "all" | "withEquipment" | "inMaintenance" | "withServices"
    >("all");
    const [equipmentByClient, setEquipmentByClient] = useState<Record<string, Equipment[]>>({});

    // Subscribe to ALL services to count them per client
    useEffect(() => {
        const unsubscribe = subscribeToServices(
            (tasks) => {
                const counts: Record<string, number> = {};
                let total = 0;
                tasks.forEach((task) => {
                    if (task.companyId) {
                        counts[task.companyId] = (counts[task.companyId] || 0) + 1;
                        total++;
                    }
                });
                setServicesByClient(counts);
                setTotalServices(total);
            },
            (error) => {
                console.error("Error subscribing to services:", error);
            }
        );
        return () => unsubscribe();
    }, []);

    // Subscribe to all equipment to calculate stats
    useEffect(() => {
        if (clients.length === 0) return;

        const unsubscribers: (() => void)[] = [];
        const equipment: Record<string, Equipment[]> = {};

        clients.forEach((client) => {
            const unsub = subscribeToEquipment(client.id, (deviceList) => {
                equipment[client.id] = deviceList;

                // Update state with current equipment map
                setEquipmentByClient({ ...equipment });

                // Recalculate totals
                let total = 0;
                let inMaintenance = 0;
                Object.values(equipment).forEach((eqs) => {
                    total += eqs.length;
                    inMaintenance += eqs.filter((e) => e.status === "maintenance").length;
                });

                setEquipmentStats({ total, inMaintenance });
            });
            unsubscribers.push(unsub);
        });

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [clients]);

    // Filtering logic
    const filteredClients = clients.filter((client) => {
        // Search filter
        const matchesSearch =
            client.name.toLowerCase().includes(search.toLowerCase()) ||
            (client.ruc && client.ruc.includes(search));

        // Stats card filter
        const clientEquipment = equipmentByClient[client.id] || [];
        let matchesStatsFilter = true;

        if (statsFilter === "withEquipment") {
            matchesStatsFilter = clientEquipment.length > 0;
        } else if (statsFilter === "inMaintenance") {
            matchesStatsFilter = clientEquipment.some((e) => e.status === "maintenance");
        } else if (statsFilter === "withServices") {
            matchesStatsFilter = (servicesByClient[client.id] || 0) > 0;
        }

        return matchesSearch && matchesStatsFilter;
    });

    // Pagination
    const {
        currentPage,
        totalPages,
        setPage,
        nextPage,
        prevPage,
        startIndex,
        endIndex
    } = usePagination({ 
        totalItems: filteredClients.length, 
        itemsPerPage: 10,
        initialPage: 1
    });

    // Handlers
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleStatsFilterChange = (filter: typeof statsFilter) => {
        setStatsFilter(statsFilter === filter ? "all" : filter);
        setPage(1);
    };

    if (loadingClients) {
        return <ClientsSkeleton />;
    }

    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return (
        <AdminLayout 
            title="Gestión de Clientes"
            subtitle="Administre su cartera de clientes y equipos"
            headerActions={<NewClientDialog />}
        >
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                    <StatsCard
                        title="Clientes"
                        value={clients.length}
                        icon={Building2}
                        active={statsFilter === "all"}
                        onClick={() => setStatsFilter("all")}
                    />
                    <StatsCard
                        title="Equipos"
                        value={equipmentStats.total}
                        icon={Wrench}
                        variant="green"
                        active={statsFilter === "withEquipment"}
                        onClick={() => handleStatsFilterChange("withEquipment")}
                    />
                    <StatsCard
                        title="Mantenimiento"
                        value={equipmentStats.inMaintenance}
                        icon={Settings}
                        variant="amber"
                        active={statsFilter === "inMaintenance"}
                        onClick={() => handleStatsFilterChange("inMaintenance")}
                    />
                    <StatsCard
                        title="Con Servicios"
                        value={totalServices}
                        icon={Wrench}
                        variant="blue"
                        active={statsFilter === "withServices"}
                        onClick={() => handleStatsFilterChange("withServices")}
                    />
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 lg:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o RUC..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm"
                            aria-label="Buscar clientes por nombre o RUC"
                        />
                    </div>
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9" aria-label="Abrir filtros avanzados">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm" className="h-9" aria-label="Cambiar orden de la lista">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Ordenar
                        </Button>
                    </div>
                </div>

                {/* Desktop Clients Table - With gray background section */}
                <div className="hidden sm:flex sm:flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 sm:py-5 lg:py-6 pb-6 lg:pb-8 bg-slate-100/70 flex-1 -mb-4 md:-mb-6 lg:-mb-8 border-t border-slate-200">
                    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[250px] lg:w-[300px]">
                                        Cliente
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell min-w-[180px]">
                                        Dirección
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell min-w-[150px]">
                                        Contacto
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell text-center w-[80px]">
                                        Equipos
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell text-center w-[80px]">
                                        Servicios
                                    </TableHead>
                                    <TableHead className="text-right w-[100px]">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingClients ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Spinner className="h-8 w-8 mx-auto" />
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Cargando clientes...
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {paginatedClients.map((client) => (
                                            <ClientRow
                                                key={client.id}
                                                client={client}
                                                servicesCount={
                                                    servicesByClient[client.id] || 0
                                                }
                                            />
                                        ))}
                                        {paginatedClients.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-8"
                                                >
                                                    <p className="text-muted-foreground">
                                                        No se encontraron clientes
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination inside gray section */}
                    {!loadingClients && filteredClients.length > 0 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalItems={filteredClients.length}
                            itemsPerPage={10}
                            itemName="clientes"
                        />
                    )}
                </div>

                {/* Mobile Clients List */}
                <div className="sm:hidden space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h2 className="text-lg font-semibold">Lista de Clientes</h2>
                        <span className="text-sm text-muted-foreground">
                            {filteredClients.length} resultados
                        </span>
                    </div>

                    {loadingClients ? (
                        <div className="text-center py-8">
                            <Spinner className="h-8 w-8 mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">
                                Cargando clientes...
                            </p>
                        </div>
                    ) : paginatedClients.length > 0 ? (
                        paginatedClients.map((client) => (
                            <ClientCardMobile key={client.id} client={client} />
                        ))
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No se encontraron clientes</p>
                        </div>
                    )}
                </div>
                
                {/* Mobile Pagination */}
                {!loadingClients && filteredClients.length > 0 && (
                    <div className="sm:hidden text-center py-4 text-sm text-muted-foreground">
                        Mostrando {paginatedClients.length} de {filteredClients.length} clientes
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
