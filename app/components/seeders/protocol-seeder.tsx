
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { createTemplate } from "~/lib/firestore";
import { Loader2, FileText } from "lucide-react";
import { DEFAULT_TEMPLATES } from "~/data/default-templates";

export function ProtocolSeeder() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleSeedProtocols = async () => {
        if (!confirm("¿Estás seguro de que quieres generar protocolos de prueba? Esto creará protocolos predefinidos.")) return;

        setLoading(true);
        setStatus("Generando protocolos...");

        try {
            let protocolsCreated = 0;
            const promises = DEFAULT_TEMPLATES.map(async (template) => {
                await createTemplate(template);
                protocolsCreated++;
            });

            await Promise.all(promises);
            setStatus(`¡Éxito! Se crearon ${protocolsCreated} protocolos.`);
        } catch (error) {
            console.error(error);
            setStatus("Error al generar protocolos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generador de Protocolos
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
                Crea los protocolos predefinidos en el sistema.
            </p>
            <div className="flex items-center gap-3">
                <Button onClick={handleSeedProtocols} disabled={loading} size="sm" variant="outline">
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Generar Protocolos
                </Button>
                {status && <span className="text-xs text-slate-600">{status}</span>}
            </div>
        </div>
    );
}
