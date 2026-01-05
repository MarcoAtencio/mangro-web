import { Shield, Users, Eye } from "lucide-react";
import { cn } from "~/lib/utils";

interface RoleBadgeProps {
    role: string;
    className?: string;
}

// Minimalist styles matching app design
const ROLE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    "ADMIN": { 
        bg: "bg-blue-50", 
        text: "text-blue-700", 
        border: "border-blue-200"
    },
    "TECHNICIAN": { 
        bg: "bg-emerald-50", 
        text: "text-emerald-700", 
        border: "border-emerald-200"
    },
    "SUPERVISOR": { 
        bg: "bg-amber-50", 
        text: "text-amber-700", 
        border: "border-amber-200"
    },
};

const ROLE_LABELS: Record<string, string> = {
    "ADMIN": "Admin",
    "TECHNICIAN": "Técnico",
    "SUPERVISOR": "Supervisor",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
    "ADMIN": <Shield className="h-3 w-3" />,
    "TECHNICIAN": <Users className="h-3 w-3" />,
    "SUPERVISOR": <Eye className="h-3 w-3" />,
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
    // Normalizing role to handle potentially legacy "TECNICO" data if not fully migrated, 
    // but ideally we migrate data. For now, let's assume we map "TECNICO" to "TECHNICIAN" logic if needed,
    // or we just display what we have. 
    // Wait, the Firestore refactor kept "TECNICO" value?
    // In firestore.ts: role: "ADMIN" | "TECHNICIAN" | "SUPERVISOR";
    // So we should expect TECHNICIAN.
    // If DB has "TECNICO", we might want to handle it.
    
    let normalizedRole = role?.toUpperCase() || "";
    if (normalizedRole === "TECNICO") normalizedRole = "TECHNICIAN"; 

    const styles = ROLE_STYLES[normalizedRole] || { 
        bg: "bg-slate-50", 
        text: "text-slate-600", 
        border: "border-slate-200"
    };
    const label = ROLE_LABELS[normalizedRole] || role || "Usuario";
    const icon = ROLE_ICONS[normalizedRole] || null;

    return (
        <div 
            className={cn(
                "inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-md border transition-colors w-24",
                styles.bg,
                styles.text,
                styles.border,
                className
            )}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}
