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

            {/* Mobile Sidebar is now handled via trigger in Header */}

            {/* Main Content */}
            <main
                className={cn(
                    "min-h-screen transition-all duration-300",
                    collapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-sm lg:px-4">
                    <div className="flex h-full items-center justify-between px-4 md:px-0">
                        <div className="flex items-center gap-4">
                            <MobileSidebar />
                            {title && (
                                <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {/* User info or actions could go here */}
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
