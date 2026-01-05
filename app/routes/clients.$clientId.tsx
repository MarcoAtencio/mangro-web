import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Client Details | MANGRO Admin" },
        { name: "description", content: "Detailed information, equipment, and history." },
    ];
};
import { useParams, useNavigate } from "react-router";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Wrench, Calendar, ArrowLeft } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { subscribeToClient, subscribeToEquipment, type Client, type Equipment } from "~/lib/firestore";
import { subscribeToClientServices, type Task } from "~/lib/services";

// Extracted components
import { ClientHeader } from "~/components/clients/client-header";
import { EquipmentGrid } from "~/components/clients/equipment-grid";
import { ServiceHistoryTable } from "~/components/clients/service-history-table";

export default function ClientDetail() {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [services, setServices] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);

    useEffect(() => {
        if (!clientId) return;

        const unsubscribeClient = subscribeToClient(clientId, (data) => {
            setClient(data);
            setLoading(false);
        });

        const unsubscribeEquipment = subscribeToEquipment(clientId, (data) => {
            setEquipment(data);
        });

        setLoadingServices(true);
        const unsubscribeServices = subscribeToClientServices(
            clientId,
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
            unsubscribeClient();
            unsubscribeEquipment();
            unsubscribeServices();
        };
    }, [clientId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!client) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <p className="text-muted-foreground text-lg">Cliente no encontrado</p>
                    <Button onClick={() => navigate("/clients")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Clientes
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout backButton={{ href: "/clients", label: "Volver a Clientes" }}>
            <div className="flex flex-col gap-12 lg:gap-14 pb-4">
                {/* Header Section */}
                <ClientHeader client={client} />

                <Tabs defaultValue="equipment" className="w-full flex-1 flex flex-col">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-slate-100 p-1 gap-1 mb-0 border border-slate-200/50 shadow-sm w-fit">
                        <TabsTrigger
                            value="equipment"
                            className="gap-2 px-4 py-1.5 text-sm font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 transition-all"
                        >
                            <Wrench className="h-4 w-4" />
                            Equipos
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="gap-2 px-4 py-1.5 text-sm font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 transition-all"
                        >
                            <Calendar className="h-4 w-4" />
                            Historial
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-6 md:py-8 bg-slate-100/70 border-t border-slate-200 flex-1 -mb-4 sm:-mb-6 lg:-mb-8 mt-0">
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                            <TabsContent value="equipment" className="mt-0 flex-1">
                                <EquipmentGrid equipment={equipment} clientId={client.id} />
                            </TabsContent>

                            <TabsContent value="history" className="mt-0">
                                <ServiceHistoryTable services={services} loading={loadingServices} />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
