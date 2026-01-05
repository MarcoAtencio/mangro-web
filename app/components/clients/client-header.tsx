import { Building2, MapPin, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Client } from "~/lib/firestore";
import React, { Suspense, lazy } from "react";

const EditClientDialog = lazy(() => import("~/components/clients/edit-client-dialog").then(m => ({ default: m.EditClientDialog })));

interface ClientHeaderProps {
    client: Client;
}

/**
 * Header component for the client detail page.
 * Displays client name, RUC, address with a link to Google Maps,
 * and a configuration button to edit the client.
 */
export function ClientHeader({ client }: ClientHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <Building2 className="h-8 w-8 text-[#0069B4]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                        {client.name}
                    </h1>
                    <div className="flex flex-col gap-1 mt-0.5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            RUC: {client.ruc || "N/A"}
                        </p>
                        {client.address ? (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-[#0069B4] hover:underline transition-all group/address w-fit"
                            >
                                <MapPin className="h-3.5 w-3.5 group-hover/address:scale-110 transition-transform" />
                                <span>{client.address}</span>
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

            <Suspense fallback={
                <Button
                    variant="outline"
                    disabled
                    className="text-sm font-semibold text-slate-200 bg-white border-slate-100 shadow-sm h-9 px-3.5"
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Cargando...
                </Button>
            }>
                <EditClientDialog
                    client={client}
                    trigger={
                        <Button
                            variant="outline"
                            className="text-sm font-semibold text-slate-600 bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-800 h-9 px-3.5"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                        </Button>
                    }
                />
            </Suspense>
        </div>
    );
}
