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
            card: "from-white to-slate-50 border-slate-200/60 ring-slate-400",
            textTitle: "text-slate-500",
            textValue: "text-slate-900",
            iconBg: "from-slate-100 to-slate-200",
            iconColor: "text-slate-600",
        },
        green: {
            card: "from-green-50 to-emerald-50 border-green-100/50 ring-green-500",
            textTitle: "text-green-700/80",
            textValue: "text-green-600",
            iconBg: "from-green-100 to-green-200",
            iconColor: "text-green-600",
        },
        amber: {
            card: "from-amber-50 to-orange-50 border-amber-100/50 ring-amber-500",
            textTitle: "text-amber-700/80",
            textValue: "text-amber-600",
            iconBg: "from-amber-100 to-amber-200",
            iconColor: "text-amber-600",
        },
        blue: {
            card: "from-blue-50 to-indigo-50 border-blue-100/50 ring-blue-500",
            textTitle: "text-blue-700/80",
            textValue: "text-blue-600",
            iconBg: "from-blue-100 to-blue-200",
            iconColor: "text-blue-600",
        },
        indigo: { 
             card: "from-indigo-50 to-violet-50 border-indigo-100/50 ring-indigo-500",
             textTitle: "text-indigo-700/80",
             textValue: "text-indigo-600",
             iconBg: "from-indigo-100 to-indigo-200",
             iconColor: "text-indigo-600",
        },
        secondary: {
             card: "from-slate-50 to-gray-50 border-slate-200/60 ring-slate-400",
             textTitle: "text-slate-500",
             textValue: "text-slate-900",
             iconBg: "from-slate-100 to-slate-200",
             iconColor: "text-slate-600",
        }
    };

    const styles = variants[variant] || variants.default;

    return (
        <Card
            className={cn(
                "bg-gradient-to-br shadow-sm transition-all duration-200 hover:-translate-y-0.5",
                styles.card,
                onClick && "cursor-pointer hover:shadow-md",
                active && "ring-2 shadow-lg",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={cn("text-xs font-medium", styles.textTitle)}>{title}</p>
                        <p className={cn("text-2xl font-bold mt-0.5", styles.textValue)}>{value}</p>
                    </div>
                    <div className={cn("p-2 bg-gradient-to-br rounded-lg", styles.iconBg)}>
                        <Icon className={cn("h-5 w-5", styles.iconColor)} />
                    </div>
                </div>
                {(description || trend) && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                         {trend && (
                            <div className={cn("flex items-center gap-1 font-medium", trend.positive !== false ? "text-green-600" : "text-red-600")}>
                                <TrendingUp className={cn("h-3 w-3", trend.positive === false && "rotate-180")} />
                                <span>{trend.value}% {trend.label}</span>
                            </div>
                         )}
                         {description && (
                             <p className={cn("text-muted-foreground", trend && "ml-1")}>
                                {description}
                             </p>
                         )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
