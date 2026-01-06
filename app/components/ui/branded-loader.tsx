import { cn } from "~/lib/utils";

interface BrandedLoaderProps {
    className?: string;
    message?: string;
}

/**
 * Branded loading screen with Mangro logo and animated spinner.
 * Use this for full-page loading states to reinforce brand identity.
 */
export function BrandedLoader({ className, message = "Cargando..." }: BrandedLoaderProps) {
    return (
        <div className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center",
            "bg-gradient-to-b from-white via-slate-50 to-slate-100",
            className
        )}>
            {/* Logo Container with animation */}
            <div className="relative mb-8 animate-fade-in">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full scale-150" />
                
                {/* Logo */}
                <img 
                    src="/logo-mangro.png" 
                    alt="Mangro" 
                    className="relative h-16 sm:h-20 lg:h-24 w-auto animate-pulse-subtle"
                />
            </div>
            
            {/* Loading indicator */}
            <div className="flex flex-col items-center gap-4">
                {/* Animated dots */}
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/60 animate-bounce" />
                </div>
                
                {/* Message */}
                <p className="text-sm text-slate-500 font-medium animate-fade-in">
                    {message}
                </p>
            </div>
        </div>
    );
}

/**
 * Inline loader for sections within a page.
 * Lighter weight than the full BrandedLoader.
 */
export function InlineLoader({ message = "Cargando..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="relative mb-6">
                <img 
                    src="/logo-mangro.png" 
                    alt="Mangro" 
                    className="h-10 w-auto opacity-80 animate-pulse"
                />
            </div>
            <div className="flex items-center gap-1.5 mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
            </div>
            <p className="text-xs text-slate-400 font-medium">{message}</p>
        </div>
    );
}
