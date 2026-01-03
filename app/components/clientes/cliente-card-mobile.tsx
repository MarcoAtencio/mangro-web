import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Building2, MapPin, Phone, Wrench, ChevronRight } from "lucide-react";
import { subscribeToEquipos, type Cliente, type Equipo } from "~/lib/firestore";
import { EditarClienteDialog } from "~/components/clientes/editar-cliente-dialog";

export function ClienteCardMobile({ cliente }: { cliente: Cliente }) {
    const navigate = useNavigate();
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToEquipos(cliente.id, (data) => {
            setEquipos(data);
        });
        return () => unsubscribe();
    }, [cliente.id]);

    return (
        <Card className="mb-4 shadow-sm border-slate-200">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{cliente.name}</p>
                            <p className="text-sm text-muted-foreground">
                                RUC: {cliente.ruc || "N/A"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <EditarClienteDialog cliente={cliente} />
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{cliente.address || "Sin dirección"}</span>
                    </div>
                    {cliente.contact_name && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{cliente.contact_name}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                        <Wrench className="h-3 w-3" />
                        {equipos.length} equipos
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/clientes/${cliente.id}`)}
                        className="text-primary hover:text-primary/80"
                    >
                        Ver Detalles
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
