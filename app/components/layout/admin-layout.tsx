import { useState } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { cn } from "~/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar />

            {/* Main Content */}
            <main
                className={cn(
                    "min-h-screen transition-all duration-300",
                    collapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-sm">
                    <div className="flex h-full items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-4">
                            <div className="md:hidden w-10" /> {/* Spacer for mobile menu button */}
                            {title && (
                                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Optional: Add notifications, search, etc. */}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
