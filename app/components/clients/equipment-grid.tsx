import { Wrench, ArrowRight } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { EquipmentStatusBadge } from "~/components/ui/equipment-status-badge";
import { NewEquipmentDialog } from "~/components/equipment/new-equipment-dialog";
import type { Equipment } from "~/lib/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EquipmentGridProps {
    equipment: Equipment[];
    clientId: string;
}

/**
 * Grid component displaying equipment cards for a client.
 * Shows empty state when no equipment exists.
 */
export function EquipmentGrid({ equipment, clientId }: EquipmentGridProps) {
    if (equipment.length === 0) {
        return (
            <>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            Catálogo de Equipos
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Gestione los equipos instalados para este cliente
                        </p>
                    </div>
                    <NewEquipmentDialog clientId={clientId} buttonText="Agregar Equipo" />
                </div>
                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-16 text-center flex flex-col items-center justify-center min-h-[350px]">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border-4 border-white shadow-sm ring-1 ring-slate-100">
                            <Wrench className="h-9 w-9 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No hay equipos registrados
                        </h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-1 font-medium">
                            Comience agregando el primer equipo instalado para este cliente.
                        </p>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 italic">
                            Puede gestionar mantenimientos y servicios desde aquí.
                        </p>
                        <NewEquipmentDialog clientId={clientId} buttonText="Agregar Primer Equipo" />
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Catálogo de Equipos
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Gestione los equipos instalados para este cliente
                    </p>
                </div>
                <NewEquipmentDialog clientId={clientId} buttonText="Agregar Equipo" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {equipment.map((item) => (
                    <Card
                        key={item.id}
                        className="group relative bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                        <CardContent className="p-0">
                            {/* Header: Icon & Status */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="h-10 w-10 rounded-lg bg-blue-50/80 flex items-center justify-center border border-blue-100/50 text-[#0069B4] group-hover:bg-[#0069B4] group-hover:text-white transition-all duration-300">
                                    <Wrench className="h-5 w-5" strokeWidth={2.5} />
                                </div>
                                <EquipmentStatusBadge status={item.status} />
                            </div>

                            {/* Body: Name & Model */}
                            <div className="px-4 pb-4">
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0069B4] transition-colors truncate mb-1">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-slate-500 truncate">{item.model}</p>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-medium">
                                    {item.lastMaintenance
                                        ? format(
                                              new Date(
                                                  item.lastMaintenance instanceof Date
                                                      ? item.lastMaintenance
                                                      : item.lastMaintenance.toDate()
                                              ),
                                              "dd MMM yyyy",
                                              { locale: es }
                                          )
                                        : "N/A"}
                                </span>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-[#0069B4] font-bold text-xs hover:no-underline flex items-center gap-1 group/btn"
                                >
                                    Ver
                                    <ArrowRight
                                        className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform"
                                        strokeWidth={3}
                                    />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
