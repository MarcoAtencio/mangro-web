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
// We might need to import EditarClienteDialog if we want to allow editing from here.
// Assuming it's available or needs export from clientes.tsx. For now I'll skip or use placeholders if it's not exported.
import { EditarClienteDialog } from "~/components/clientes/editar-cliente-dialog";

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
            title={cliente.name} 
            subtitle={`RUC: ${cliente.ruc || "N/A"}`}
            breadcrumb={[
                { label: "MANGRO", href: "/dashboard" }, 
                { label: "Clientes", href: "/clientes" },
                { label: cliente.name }
            ]}
            headerActions={
                <div className="flex gap-2">
                    <EditarClienteDialog 
                        cliente={cliente}
                        trigger={
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Editar Cliente
                            </Button>
                        }
                    />
                </div>
            }
        >
            <div className="flex flex-col gap-8">
                {/* Header Information Card */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm/5">
                    <div className="flex items-start gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                            <Building2 className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                                    {cliente.name}
                                </h1>
                                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    RUC: {cliente.ruc || "N/A"}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4 ml-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {cliente.address}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {cliente.phone || "Sin teléfono"}
                                </div>
                                {cliente.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {cliente.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                        {/* Placeholder for Edit Dialog if exported, or just link */}
                        {/* <EditarClienteDialog cliente={cliente} /> */}
                        {/* Temporary generic button if component not available */}
                        <Button variant="outline" disabled>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                        </Button>
                    </div>
                </div>

                {/* Tabs Content */}
                <Tabs defaultValue="equipos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                        <TabsTrigger value="equipos" className="gap-2">
                            <Wrench className="h-4 w-4" />
                            Equipos
                            <Badge variant="secondary" className="ml-1">
                                {equipos.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="historial" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Historial
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="equipos" className="mt-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Catálogo de Equipos</h2>
                            <NuevoEquipoDialog clienteId={cliente.id} />
                        </div>

                        {equipos.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {equipos.map((equipo) => (
                                    <Card
                                        key={equipo.id}
                                        className="hover:shadow-md transition-shadow group"
                                    >
                                        <CardContent className="p-5 relative">
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <EditarEquipoDialog
                                                    clienteId={cliente.id}
                                                    equipo={equipo}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                                                        <Wrench className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className="font-semibold text-sm truncate"
                                                            title={equipo.nombre}
                                                        >
                                                            {equipo.nombre}
                                                        </p>
                                                        <p
                                                            className="text-xs text-muted-foreground truncate"
                                                            title={equipo.modelo}
                                                        >
                                                            {equipo.modelo}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">
                                                            Serie
                                                        </p>
                                                        <p className="text-xs font-medium font-mono truncate">
                                                            {equipo.serie}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">
                                                            Mantenimiento
                                                        </p>
                                                        <p className="text-xs font-medium truncate">
                                                            {equipo.ultimo_mantenimiento
                                                                ? format(
                                                                      new Date(
                                                                          equipo.ultimo_mantenimiento as Date
                                                                      ),
                                                                      "dd MMM yyyy",
                                                                      { locale: es }
                                                                  )
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 pt-1">
                                                        {getEstadoBadge(equipo.estado)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                                <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">
                                    No hay equipos registrados
                                </p>
                                <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                                    Registra los equipos instalados en este cliente.
                                </p>
                                <NuevoEquipoDialog clienteId={cliente.id} />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="historial" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Historial de Servicios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Prioridad</TableHead>
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
                                                        <p className="text-sm font-medium">
                                                            {service.description ||
                                                                "Sin descripción"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {service.equipmentSummary}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                service.status === "COMPLETADO"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="text-[10px]"
                                                        >
                                                            {service.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {service.priority}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center py-12 text-muted-foreground italic"
                                                >
                                                    No hay servicios registrados para este cliente.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
