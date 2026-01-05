import { Badge } from "~/components/ui/badge";

type EquipmentStatus = 
    | "ACTIVE" | "OPERATIVO" | "ACTIVO" | "active" | "operativo" | "activo"
    | "MAINTENANCE" | "MANTENIMIENTO" | "maintenance" | "mantenimiento"
    | "INACTIVE" | "INACTIVO" | "inactive" | "inactivo";

interface EquipmentStatusBadgeProps {
    status: string;
}

/**
 * Badge component for equipment status.
 * Handles both English and Spanish status values.
 */
export function EquipmentStatusBadge({ status }: EquipmentStatusBadgeProps) {
    const normalizedStatus = status.toLowerCase();
    
    if (["active", "operativo", "activo"].includes(normalizedStatus)) {
        return (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100">
                Operativo
            </Badge>
        );
    }
    
    if (["maintenance", "mantenimiento"].includes(normalizedStatus)) {
        return (
            <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100">
                Mantenimiento
            </Badge>
        );
    }
    
    if (["inactive", "inactivo"].includes(normalizedStatus)) {
        return <Badge variant="destructive">Inactivo</Badge>;
    }
    
    return <Badge variant="secondary">{status}</Badge>;
}
