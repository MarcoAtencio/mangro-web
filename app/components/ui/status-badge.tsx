
import { SERVICE_STATUS, type ServiceStatus } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

// Estilos que combinan con el diseño minimalista de la app
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    "PENDIENTE": { 
        bg: "bg-slate-100", 
        text: "text-slate-600", 
        border: "border-slate-200"
    },
    "EN_PROGRESO": { 
        bg: "bg-blue-50", 
        text: "text-blue-700", 
        border: "border-blue-200"
    },
    "COMPLETADO": { 
        bg: "bg-emerald-50", 
        text: "text-emerald-700", 
        border: "border-emerald-200"
    },
    "CANCELADO": { 
        bg: "bg-red-50", 
        text: "text-red-700", 
        border: "border-red-200"
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const lookupKey = (status || "").toUpperCase().replace(/\s+/g, '_');
    const styles = STATUS_STYLES[lookupKey] || STATUS_STYLES["PENDIENTE"];
    const displayText = lookupKey.replace(/_/g, " ");

    return (
        <span 
            className={cn(
                "inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-md border transition-colors",
                styles.bg,
                styles.text,
                styles.border,
                className
            )}
        >
            {displayText}
        </span>
    );
}
