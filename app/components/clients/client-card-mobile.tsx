import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Building2, MapPin, Phone, Wrench, ChevronRight, Settings } from "lucide-react";
import { subscribeToEquipment, type Client, type Equipment } from "~/lib/firestore";
import React, { Suspense, lazy } from "react";

const EditClientDialog = lazy(() => import("~/components/clients/edit-client-dialog").then(m => ({ default: m.EditClientDialog })));

export function ClientCardMobile({ client, equipmentCount = 0 }: { client: Client, equipmentCount?: number }) {
    const navigate = useNavigate();

    const [showEditDialog, setShowEditDialog] = useState(false);

    return (
        <Card 
            className="mb-4 shadow-sm border-slate-200/60 overflow-hidden hover:shadow-md transition-all duration-300 group active:scale-[0.98]"
            onClick={() => navigate(`/clients/${client.id}`)}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles del cliente ${client.name}`}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    navigate(`/clients/${client.id}`);
                }
            }}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                            <Building2 className="h-6 w-6 text-slate-500 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <p className="font-bold text-slate-900 truncate leading-tight">{client.name}</p>
                            <p className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                                RUC: {client.ruc || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                        <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <span className="line-clamp-1">{client.address || "No address"}</span>
                    </div>
                    {client.contactName && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-500">
                            <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="truncate">{client.contactName}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100/50 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                            <Wrench className="h-3 w-3" />
                            {equipmentCount} Equipment
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                            onClick={() => setShowEditDialog(true)}
                            aria-label={`Editar cliente ${client.name}`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {showEditDialog && (
                            <Suspense fallback={null}>
                                <EditClientDialog 
                                    client={client}
                                    open={true}
                                    onOpenChange={setShowEditDialog}
                                />
                            </Suspense>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
