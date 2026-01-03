import { useState } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { cn } from "~/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerActions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, headerActions }: AdminLayoutProps) {
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
                    "min-h-screen flex flex-col transition-all duration-300",
                    collapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 py-6 bg-background lg:px-4">
                    <div className="flex items-center justify-between px-4 md:px-0">
                        <div className="flex items-center gap-4">
                            <MobileSidebar />
                            {title && (
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className="text-sm text-muted-foreground hidden sm:block">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {headerActions}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="px-4 md:px-8 pt-4 md:pt-6 flex flex-col flex-1">{children}</div>
            </main>
        </div>
    );
}
