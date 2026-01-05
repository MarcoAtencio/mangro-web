import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { Building2, MapPin, Phone, Settings, ChevronRight } from "lucide-react";
import { subscribeToEquipment, type Client, type Equipment } from "~/lib/firestore";
import { EditClientDialog } from "~/components/clients/edit-client-dialog";

interface ClientRowProps {
    client: Client;
    servicesCount?: number;
}

export function ClientRow({ client, servicesCount = 0 }: ClientRowProps) {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<Equipment[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToEquipment(client.id, (data) => {
            setEquipment(data);
        });
        return () => unsubscribe();
    }, [client.id]);

    return (
        <TableRow
            className="hover:bg-slate-50 cursor-pointer transition-all duration-300 hover:shadow-sm group"
            onClick={() => navigate(`/clients/${client.id}`)}
        >
            <TableCell className="transition-all duration-300 group-hover:pl-5">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex flex-col max-w-[250px]">
                        <span className="font-medium text-sm truncate">{client.name}</span>
                        <span className="text-xs text-muted-foreground">RUC: {client.ruc || "N/A"}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5 max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                        {client.address || "No address"}
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex flex-col max-w-[150px]">
                    <span className="font-medium text-sm truncate">
                        {client.contactName || "No contact"}
                    </span>
                    {client.phone ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">Not registered</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-semibold text-slate-700">{equipment.length}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Equipment
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-semibold text-slate-700">{servicesCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Services
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <div onClick={(e) => e.stopPropagation()}>
                        <EditClientDialog
                            client={client}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                        aria-label={`Ver detalles de ${client.name}`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
