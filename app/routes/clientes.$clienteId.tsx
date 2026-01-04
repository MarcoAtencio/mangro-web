import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Detalle de Cliente | MANGRO Admin" },
        { name: "description", content: "Información detallada, equipos e historial del cliente." },
    ];
};
import { useParams, useNavigate } from "react-router";
import { AdminLayout } from "~/components/layout/admin-layout";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import {
    ChevronLeft,
    Wrench,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ArrowLeft,
    Building2,
    Settings,
} from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { subscribeToCliente, subscribeToEquipos, type Cliente, type Equipo } from "~/lib/firestore";
import { subscribeToClientServices, type Task } from "~/lib/services";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Separator } from "~/components/ui/separator";
import { NuevoEquipoDialog } from "~/components/equipos/nuevo-equipo-dialog";
import { EditarEquipoDialog } from "~/components/equipos/editar-equipo-dialog";
import { EditarClienteDialog } from "~/components/clientes/editar-cliente-dialog";
import { StatsCard } from "~/components/ui/stats-card";
import { Activity, ClipboardList, ShieldCheck } from "lucide-react";

export default function ClienteDetalle() {
    const { clienteId } = useParams();
    const navigate = useNavigate();

    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [services, setServices] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);

    useEffect(() => {
        if (!clienteId) return;

        const unsubscribeCliente = subscribeToCliente(clienteId, (data) => {
            setCliente(data);
            setLoading(false);
        });

        const unsubscribeEquipos = subscribeToEquipos(clienteId, (data) => {
            setEquipos(data);
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingServices(true);
        const unsubscribeServices = subscribeToClientServices(
            clienteId,
            (data) => {
                setServices(data);
                setLoadingServices(false);
            },
            (err) => {
                console.error(err);
                setLoadingServices(false);
            }
        );

        return () => {
            unsubscribeCliente();
            unsubscribeEquipos();
            unsubscribeServices();
        };
    }, [clienteId]);

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case "activo":
                return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
            case "mantenimiento":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Mantenimiento</Badge>;
            case "inactivo":
                return <Badge variant="destructive">Inactivo</Badge>;
            default:
                return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!cliente) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <p className="text-muted-foreground text-lg">Cliente no encontrado</p>
                    <Button onClick={() => navigate("/clientes")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Clientes
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            backButton={{ href: "/clientes", label: "Volver a Clientes" }}
        >
            <div className="flex flex-col gap-10 lg:gap-12 pb-4">
                {/* Header Section - Pixel Perfect Match to Prototype 2 */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                            <Building2 className="h-8 w-8 text-[#0069B4]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                                {cliente.name}
                            </h1>
                            <div className="flex flex-col gap-1 mt-0.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    RUC: {cliente.ruc || "N/A"}
                                </p>
                                {cliente.address ? (
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-[#0069B4] hover:underline transition-all group/address w-fit"
                                    >
                                        <MapPin className="h-3.5 w-3.5 group-hover/address:scale-110 transition-transform" />
                                        <span>{cliente.address}</span>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>Sin dirección</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <EditarClienteDialog 
                        cliente={cliente}
                        trigger={
                            <Button variant="outline" className="text-sm font-semibold text-slate-600 bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-800 h-9 px-3.5">
                                <Settings className="mr-2 h-4 w-4" />
                                Configuración
                            </Button>
                        }
                    />
                </div>

                <Tabs defaultValue="equipos" className="w-full flex-1 flex flex-col">
                    {/* Tabs - Relocated to the white section (upper part) with more breathing room */}
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-slate-100 p-1 gap-1 mb-0 border border-slate-200/50 shadow-sm w-fit">
                        <TabsTrigger 
                            value="equipos" 
                            className="gap-2 px-4 py-1.5 text-sm font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 transition-all"
                        >
                            <Wrench className="h-4 w-4" />
                            Equipos
                            {equipos.length > 0 && (
                                <Badge className="ml-1.5 h-5 px-1.5 bg-blue-50 text-[#0069B4] border-transparent font-bold text-[10px]">
                                    {equipos.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="historial" 
                            className="gap-2 px-4 py-1.5 text-sm font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 transition-all"
                        >
                            <Calendar className="h-4 w-4" />
                            Historial
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Operational Content Area - Wrapped in Gray starting after the tabs with a tighter transition */}
                    <div className="flex flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-6 md:py-8 bg-slate-100/70 border-t border-slate-200 flex-1 -mb-4 sm:-mb-6 lg:-mb-8 mt-2">
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                            <TabsContent value="equipos" className="mt-0 flex-1">
                        {/* Summary Section or Stats could go here if user wants them back, 
                            but focusing first on the Prototype 2 header alignment */}
                        
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Catálogo de Equipos</h2>
                                <p className="text-sm text-slate-500 font-medium">Administra los equipos instalados en este cliente</p>
                            </div>
                            <NuevoEquipoDialog clienteId={cliente.id} buttonText="Agregar Equipo" />
                        </div>

                        {equipos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {equipos.map((equipo) => (
                                    <Card key={equipo.id} className="group relative overflow-hidden border-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <CardContent className="p-0">
                                            <div className="p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                                                        <Wrench className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <Badge className={cn(
                                                        "font-bold uppercase tracking-widest text-[10px] px-2 py-0.5",
                                                        equipo.estado === 'activo' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}>
                                                        {equipo.estado}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-1 mb-4">
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                        {equipo.nombre}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span className="font-medium">{equipo.modelo}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">S/N: 2024-001{equipo.id.slice(-3)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Último Mantenimiento</span>
                                                        <span className="text-xs font-semibold text-slate-700">15 Oct 2023</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-1 p-0 px-2">
                                                        Ver Detalle <ChevronLeft className="h-4 w-4 rotate-180" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center h-[400px] flex flex-col items-center justify-center">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                    <Wrench className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    No hay equipos registrados
                                </h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-1">
                                    Comienza agregando el primer equipo instalado en este cliente.
                                </p>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                                    Podrás gestionar mantenimientos y servicios desde aquí.
                                </p>
                                <NuevoEquipoDialog clienteId={cliente.id} buttonText="Agregar Primer Equipo" />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="historial" className="mt-0">
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                                    Historial de Servicios
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="w-[140px] font-bold text-slate-500 text-[11px] uppercase tracking-wider">Fecha</TableHead>
                                            <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">Descripción / Equipo</TableHead>
                                            <TableHead className="w-[120px] font-bold text-slate-500 text-[11px] uppercase tracking-wider">Estado</TableHead>
                                            <TableHead className="w-[100px] font-bold text-slate-500 text-[11px] uppercase tracking-wider">Prioridad</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingServices ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <Spinner className="h-6 w-6 mx-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ) : services.length > 0 ? (
                                            services.map((service) => (
                                                <TableRow key={service.id}>
                                                    <TableCell className="text-sm font-medium">
                                                        {service.createAt
                                                            ? format(
                                                                  new Date(
                                                                      service.createAt as Date
                                                                  ),
                                                                  "dd MMM yyyy",
                                                                  { locale: es }
                                                              )
                                                            : "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {service.description || "Sin descripción"}
                                                            </span>
                                                            <span className="text-[11px] text-slate-500 font-medium">
                                                                {service.equipmentSummary}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={cn(
                                                                "font-bold uppercase tracking-widest text-[9px] px-2 py-0.5",
                                                                service.status === "COMPLETADO" 
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                                            )}
                                                        >
                                                            {service.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-[9px] font-bold border-slate-200">
                                                            {service.priority}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center py-20 text-slate-400 italic"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <ClipboardList className="h-8 w-8 opacity-20" />
                                                        <span>No hay servicios registrados para este cliente.</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
