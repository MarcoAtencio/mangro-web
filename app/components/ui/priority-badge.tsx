
import { SERVICE_PRIORITY, type ServicePriority } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface PriorityBadgeProps {
    priority: string;
    className?: string;
}

// Estilos que combinan con el diseño minimalista de la app
const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    "URGENTE": { 
        bg: "bg-red-50", 
        text: "text-red-800", 
        border: "border-red-200"
    },
    "ALTA": { 
        bg: "bg-orange-50", 
        text: "text-orange-800", 
        border: "border-orange-200"
    },
    "MEDIA": { 
        bg: "bg-amber-50", 
        text: "text-amber-800", 
        border: "border-amber-200"
    },
    "BAJA": { 
        bg: "bg-teal-50", 
        text: "text-teal-800", 
        border: "border-teal-200"
    },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const lookupKey = (priority || "").toUpperCase().replace(/\s+/g, '_');
    const styles = PRIORITY_STYLES[lookupKey] || PRIORITY_STYLES["BAJA"];

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
            {lookupKey}
        </span>
    );
}
