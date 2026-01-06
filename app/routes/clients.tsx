import { type MetaFunction } from "react-router";
import { useState, useEffect, lazy, Suspense, useMemo, useRef } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Gestión de Clientes | MANGRO Admin" },
        { name: "description", content: "Administre su cartera de clientes, equipos y contratos en el panel de MANGRO S.A.C." },
    ];
};

// ============================================================================
// NON-BLOCKING LOADER - Retorna inmediatamente para LCP instantáneo
// ============================================================================
// Los datos se cargan via suscripción en tiempo real, no bloqueamos el render
export function clientLoader() {
    return null;
}

import { Plus } from "lucide-react";

// Lazy loading the main action dialog to reduce initial bundle
const NewClientDialog = lazy(() => import("~/components/clients/new-client-dialog").then(m => ({ default: m.NewClientDialog })));

import { AdminLayout } from "~/components/layout/admin-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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

import { usePagination } from "~/hooks/use-pagination";
import { subscribeToClients, subscribeToEquipment, type Client, type Equipment } from "~/lib/firestore";
import { subscribeToServices } from "~/lib/services"; 

import { ClientRow } from "~/components/clients/client-row";
import { ClientCardMobile } from "~/components/clients/client-card-mobile";
import { StatsCard } from "~/components/ui/stats-card";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { ClientsSkeleton } from "~/components/clients/clients-skeleton";

export default function ClientsPage() {
    // Iniciar con null para detectar estado de carga
    const [clients, setClients] = useState<Client[] | null>(null);
    const [search, setSearch] = useState("");
    const [showNewClientDialog, setShowNewClientDialog] = useState(false);
    
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

    // Subscribe to Clients for real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToClients((data) => {
            setClients(data);
        });
        return () => unsubscribe();
    }, []);

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

    // Subscribe to all equipment to calculate stats - Optimized to avoid full resubscription
    const unsubscribersRef = useRef<Record<string, () => void>>({});
    const equipmentMapRef = useRef<Record<string, Equipment[]>>({});

    useEffect(() => {
        if (!clients || clients.length === 0) return;

        // IDs of current clients
        const clientIds = new Set(clients.map(c => c.id));
        
        // Remove subscriptions for clients that no longer exist
        Object.keys(unsubscribersRef.current).forEach(id => {
            if (!clientIds.has(id)) {
                unsubscribersRef.current[id]();
                delete unsubscribersRef.current[id];
                delete equipmentMapRef.current[id];
            }
        });

        // Add subscriptions for new clients
        clients.forEach((client) => {
            if (!unsubscribersRef.current[client.id]) {
                unsubscribersRef.current[client.id] = subscribeToEquipment(client.id, (deviceList) => {
                    equipmentMapRef.current[client.id] = deviceList;
                    
                    // Update state with a slight delay or batch if possible, but for now 
                    // we just ensure we don't recreate all subscriptions.
                    setEquipmentByClient(prev => ({ ...prev, [client.id]: deviceList }));

                    // Recalculate totals from the ref to ensure we have the latest global state
                    let total = 0;
                    let inMaintenance = 0;
                    Object.values(equipmentMapRef.current).forEach((eqs: Equipment[]) => {
                        total += eqs.length;
                        inMaintenance += eqs.filter((e) => e.status === "maintenance").length;
                    });
                    setEquipmentStats({ total, inMaintenance });
                });
            }
        });
    }, [clients]); // Still depends on clients to detect new/removed ones, but internally stable

    // Mostrar skeleton mientras carga
    if (clients === null) {
        return <ClientsSkeleton />;
    }

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

    return (
        <ClientsPageContent
            clients={clients}
            filteredClients={filteredClients}
            search={search}
            setSearch={setSearch}
            showNewClientDialog={showNewClientDialog}
            setShowNewClientDialog={setShowNewClientDialog}
            equipmentStats={equipmentStats}
            servicesByClient={servicesByClient}
            totalServices={totalServices}
            statsFilter={statsFilter}
            setStatsFilter={setStatsFilter}
            equipmentByClient={equipmentByClient}
        />
    );
}

// ============================================================================
// CONTENT COMPONENT - Separado para evitar re-renders del skeleton check
// ============================================================================
interface ClientsPageContentProps {
    clients: Client[];
    filteredClients: Client[];
    search: string;
    setSearch: (val: string) => void;
    showNewClientDialog: boolean;
    setShowNewClientDialog: (val: boolean) => void;
    equipmentStats: { total: number; inMaintenance: number };
    servicesByClient: Record<string, number>;
    totalServices: number;
    statsFilter: "all" | "withEquipment" | "inMaintenance" | "withServices";
    setStatsFilter: (val: "all" | "withEquipment" | "inMaintenance" | "withServices") => void;
    equipmentByClient: Record<string, Equipment[]>;
}

function ClientsPageContent({
    clients,
    filteredClients,
    search,
    setSearch,
    showNewClientDialog,
    setShowNewClientDialog,
    equipmentStats,
    servicesByClient,
    totalServices,
    statsFilter,
    setStatsFilter,
    equipmentByClient,
}: ClientsPageContentProps) {
    // Pagination
    const {
        currentPage,
        totalPages,
        setPage,
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

    const paginatedClients = useMemo(() => {
        return filteredClients.slice(startIndex, endIndex);
    }, [filteredClients, startIndex, endIndex]);

    return (
        <AdminLayout 
            title="Gestión de Clientes"
            subtitle="Administre su cartera de clientes y equipos"
            headerActions={
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setShowNewClientDialog(true)}
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden lg:inline">Nuevo Cliente</span>
                    </Button>
                    {showNewClientDialog && (
                        <Suspense fallback={null}>
                            <NewClientDialog 
                                open={showNewClientDialog} 
                                onOpenChange={setShowNewClientDialog} 
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o RUC..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 h-10 sm:h-9 bg-white border-slate-200 focus:border-primary transition-colors shadow-sm text-base sm:text-sm"
                            aria-label="Buscar clientes por nombre o RUC"
                        />
                    </div>
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 sm:h-9" aria-label="Abrir filtros avanzados">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 sm:h-9" aria-label="Cambiar orden de la lista">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Ordenar
                        </Button>
                    </div>
                </div>

                {/* Desktop Clients Table - With gray background section */}
                <div className="hidden lg:flex lg:flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 sm:py-5 lg:py-6 pb-6 lg:pb-8 bg-slate-100/70 flex-1 -mb-4 md:-mb-6 lg:-mb-8 border-t border-slate-200">
                    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-[200px] lg:w-[250px]">
                                        Cliente
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell min-w-[150px]">
                                        Dirección
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell min-w-[150px]">
                                        Contacto
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center w-[80px]">
                                        Equipos
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center w-[80px]">
                                        Servicios
                                    </TableHead>
                                    <TableHead className="text-right w-[100px]">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedClients.map((client) => (
                                    <ClientRow
                                        key={client.id}
                                        client={client}
                                        servicesCount={
                                            servicesByClient[client.id] || 0
                                        }
                                        equipmentCount={
                                            (equipmentByClient[client.id] || []).length
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
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination inside gray section */}
                    {filteredClients.length > 0 && (
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

                {/* Mobile/Tablet Clients List */}
                <div className="lg:hidden space-y-4">
                    <div className="flex items-center justify-between pb-2">
                        <h2 className="text-lg font-semibold">Lista de Clientes</h2>
                        <span className="text-sm text-muted-foreground">
                            {filteredClients.length} resultados
                        </span>
                    </div>

                    {paginatedClients.length > 0 ? (
                        paginatedClients.map((client) => (
                            <ClientCardMobile 
                                key={client.id} 
                                client={client} 
                                equipmentCount={(equipmentByClient[client.id] || []).length}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No se encontraron clientes</p>
                        </div>
                    )}
                </div>
                
                {/* Mobile/Tablet Pagination */}
                {filteredClients.length > 0 && (
                    <div className="lg:hidden">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalItems={filteredClients.length}
                            itemsPerPage={10}
                            itemName="clientes"
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
