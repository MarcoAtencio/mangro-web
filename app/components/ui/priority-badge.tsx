
import { Badge } from "~/components/ui/badge";
import { SERVICE_PRIORITY, type ServicePriority } from "~/lib/constants";

interface PriorityBadgeProps {
    priority: string | undefined;
}

const PRIORITY_STYLES: Record<ServicePriority, string> = {
    [SERVICE_PRIORITY.URGENTE]: "bg-red-100 text-red-800 border-red-200",
    [SERVICE_PRIORITY.ALTA]: "bg-red-100 text-red-800 border-red-200",
    [SERVICE_PRIORITY.MEDIA]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [SERVICE_PRIORITY.BAJA]: "bg-green-100 text-green-800 border-green-200",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const normalizedPriority = (priority?.toUpperCase() || SERVICE_PRIORITY.MEDIA) as ServicePriority;

    const className = PRIORITY_STYLES[normalizedPriority] || "bg-gray-100 text-gray-800";

    return (
        <Badge variant="outline" className={className}>
            {normalizedPriority}
        </Badge>
    );
}

