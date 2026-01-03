
import { Badge } from "~/components/ui/badge";
import { SERVICE_STATUS, type ServiceStatus } from "~/lib/constants";

interface StatusBadgeProps {
    status: string;
}

const STATUS_STYLES: Record<ServiceStatus, string> = {
    [SERVICE_STATUS.COMPLETADO]: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    [SERVICE_STATUS.EN_PROGRESO]: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    [SERVICE_STATUS.PENDIENTE]: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
    [SERVICE_STATUS.CANCELADO]: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = (status?.toUpperCase() || SERVICE_STATUS.PENDIENTE) as ServiceStatus;
    
    const className = STATUS_STYLES[normalizedStatus] || "bg-gray-100 text-gray-800";

    return (
        <Badge variant="outline" className={className}>
            {normalizedStatus}
        </Badge>
    );
}

