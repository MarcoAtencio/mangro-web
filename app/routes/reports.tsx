import type { MetaFunction } from "react-router";
import { AdminLayout } from "~/components/layout/admin-layout";
import { Card, CardContent } from "~/components/ui/card";
import { FileText } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Reportes | MANGRO Admin" },
        { name: "description", content: "Reportes de servicio y documentación." },
    ];
};

export default function ReportsPage() {
    return (
        <AdminLayout 
            title="Reportes" 
            subtitle="Vea y administre los reportes de servicio"
        >
            <div className="flex flex-col flex-1 items-center justify-center p-8 text-center text-muted-foreground">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Módulo de Reportes en Construcción</h3>
                <p className="max-w-sm mx-auto">
                    El módulo de reportes está actualmente en construcción. 
                    Vuelva pronto para ver la funcionalidad completa.
                </p>
            </div>
        </AdminLayout>
    );
}
