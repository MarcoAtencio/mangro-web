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
            className="cursor-pointer hover:bg-slate-50/80 transition-all duration-200 group"
            onClick={() => navigate(`/clientes/${cliente.id}`)}
        >
            <TableCell className="py-5">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 mt-1 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform duration-200 shadow-sm shrink-0">
                        <Building2 className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-slate-900 text-base leading-tight">
                            {cliente.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono pl-0.5">
                            <span className="font-semibold text-slate-400">RUC:</span>
                            {cliente.ruc || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[280px]">
                                {cliente.address || "Sin dirección"}
                            </span>
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell py-4">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-700">
                        {cliente.contact_name || "Sin contacto"}
                    </span>
                    {cliente.phone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.phone}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-center py-4">
                <div className="inline-flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-700">{equipos.length}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Equipos
                    </span>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell text-center py-4">
                <div className="inline-flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-700">{serviciosCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Servicios
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right py-4">
                <div className="flex items-center justify-end gap-1">
                    <div onClick={(e) => e.stopPropagation()}>
                        <EditarClienteDialog
                            cliente={cliente}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
