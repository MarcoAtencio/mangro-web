import { Shield, Users } from "lucide-react";
import { cn } from "~/lib/utils";

interface RoleBadgeProps {
    role: string;
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const baseClasses =
        "px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 w-28 shadow-sm";

    switch (role) {
        case "ADMIN":
            return (
                <div className={cn(baseClasses, "bg-blue-50 text-blue-700 border-blue-200", className)}>
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                </div>
            );
        case "TECNICO":
            return (
                <div className={cn(baseClasses, "bg-green-50 text-green-700 border-green-200", className)}>
                    <Users className="h-3.5 w-3.5" />
                    Técnico
                </div>
            );
        case "SUPERVISOR":
            return (
                <div className={cn(baseClasses, "bg-amber-50 text-amber-700 border-amber-200", className)}>
                    <Shield className="h-3.5 w-3.5" />
                    Supervisor
                </div>
            );
        default:
            return (
                <div className={cn(baseClasses, "bg-slate-50 text-slate-700 border-slate-200", className)}>
                    {role}
                </div>
            );
    }
}
