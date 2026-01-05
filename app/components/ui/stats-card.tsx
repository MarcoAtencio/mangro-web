import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: { value: number; label: string; positive?: boolean };
    variant?: "default" | "green" | "amber" | "blue" | "indigo" | "secondary";
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    variant = "default",
    active = false,
    onClick,
    className,
}: StatsCardProps) {
    const variants = {
        default: {
            card: "from-white to-slate-50 border-slate-200/60 shadow-sm",
            textTitle: "text-slate-500 uppercase tracking-wider font-semibold",
            textValue: "text-slate-900",
            iconBg: "bg-slate-100 text-slate-500 shadow-inner",
            iconColor: "text-slate-600",
        },
        green: {
            card: "from-white to-emerald-50/30 border-emerald-100 shadow-sm",
            textTitle: "text-emerald-800 uppercase tracking-wider font-bold",
            textValue: "text-emerald-900",
            iconBg: "bg-emerald-100 text-emerald-700 shadow-inner",
            iconColor: "text-emerald-700",
        },
        amber: {
            card: "from-white to-amber-50/30 border-amber-100 shadow-sm",
            textTitle: "text-amber-800 uppercase tracking-wider font-bold",
            textValue: "text-amber-900",
            iconBg: "bg-amber-100 text-amber-700 shadow-inner",
            iconColor: "text-amber-700",
        },
        blue: {
            card: "from-white to-blue-50/30 border-blue-100 shadow-sm",
            textTitle: "text-blue-800 uppercase tracking-wider font-bold",
            textValue: "text-blue-900",
            iconBg: "bg-blue-100 text-blue-700 shadow-inner",
            iconColor: "text-blue-700",
        },
        indigo: { 
             card: "from-white to-indigo-50/30 border-indigo-100 shadow-sm",
             textTitle: "text-indigo-800 uppercase tracking-wider font-bold",
             textValue: "text-indigo-900",
             iconBg: "bg-indigo-100 text-indigo-700 shadow-inner",
             iconColor: "text-indigo-700",
        },
        secondary: {
             card: "from-white to-slate-100/50 border-slate-200 shadow-sm",
             textTitle: "text-slate-500 uppercase tracking-wider font-semibold",
             textValue: "text-slate-900",
             iconBg: "bg-slate-200/50 text-slate-600 shadow-inner",
             iconColor: "text-slate-600",
        }
    };

    const styles = variants[variant] || variants.default;

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
                "bg-gradient-to-br border",
                styles.card,
                onClick && "cursor-pointer",
                active && "ring-2 ring-primary ring-offset-2",
                className
            )}
            onClick={onClick}
        >
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-current opacity-[0.03] blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                        <p className={cn("text-[11px] sm:text-[11px] lg:text-xs truncate", styles.textTitle)}>{title}</p>
                        <div className="flex items-baseline gap-1">
                            <p className={cn("text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight", styles.textValue)}>
                                {value}
                            </p>
                            {trend && (
                                <span className={cn(
                                    "text-[10px] sm:text-[11px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full",
                                    trend.positive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {trend.positive !== false ? "+" : ""}{trend.value}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={cn(
                        "p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0",
                        styles.iconBg
                    )}>
                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6", styles.iconColor)} />
                    </div>
                </div>
                {description && (
                    <p className="mt-2 sm:mt-3 lg:mt-4 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
