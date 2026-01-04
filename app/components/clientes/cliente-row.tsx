import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { TableCell, TableRow } from "~/components/ui/table";
import { Building2, MapPin, Phone, Settings, ChevronRight } from "lucide-react";
import { subscribeToEquipos, type Cliente, type Equipo } from "~/lib/firestore";
import { EditarClienteDialog } from "~/components/clientes/editar-cliente-dialog";

interface ClienteRowProps {
    cliente: Cliente;
    serviciosCount?: number;
}

export function ClienteRow({ cliente, serviciosCount = 0 }: ClienteRowProps) {
    const navigate = useNavigate();
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToEquipos(cliente.id, (data) => {
            setEquipos(data);
        });
        return () => unsubscribe();
    }, [cliente.id]);

    return (
        <TableRow
            className="hover:bg-slate-50 cursor-pointer transition-all duration-300 hover:shadow-sm group"
            onClick={() => navigate(`/clientes/${cliente.id}`)}
        >
            <TableCell className="transition-all duration-300 group-hover:pl-5">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex flex-col max-w-[250px]">
                        <span className="font-medium text-sm truncate">{cliente.name}</span>
                        <span className="text-xs text-muted-foreground">RUC: {cliente.ruc || "N/A"}</span>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5 max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                        {cliente.address || "Sin dirección"}
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex flex-col max-w-[150px]">
                    <span className="font-medium text-sm truncate">
                        {cliente.contact_name || "Sin contacto"}
                    </span>
                    {cliente.phone ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.phone}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">No registrado</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-semibold text-slate-700">{equipos.length}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Equipos
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-center">
                <div className="inline-flex flex-col items-center">
                    <span className="text-lg font-semibold text-slate-700">{serviciosCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Servicios
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <div onClick={(e) => e.stopPropagation()}>
                        <EditarClienteDialog
                            cliente={cliente}
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
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
