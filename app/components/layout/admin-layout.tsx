import React, { useState } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { cn } from "~/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerActions?: React.ReactNode;
    breadcrumb?: { label: string; href?: string }[];
}

export function AdminLayout({
    children,
    title,
    subtitle,
    headerActions,
    breadcrumb
}: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Desktop Sidebar - visible only on xl and up */}
            <div className="hidden xl:block">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </div>

            <main
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 min-h-screen",
                    collapsed ? "xl:ml-16" : "xl:ml-64"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 py-3 md:py-4 bg-white/80 backdrop-blur-md px-4 md:px-6 lg:px-8">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <MobileSidebar />
                            
                            <div className="flex flex-col gap-0.5">
                                {/* Breadcrumbs */}
                                {breadcrumb && (
                                    <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                                        {breadcrumb.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                {item.href ? (
                                                    <a href={item.href} className="hover:text-primary transition-colors">
                                                        {item.label}
                                                    </a>
                                                ) : (
                                                    <span>{item.label}</span>
                                                )}
                                                {idx < breadcrumb.length - 1 && (
                                                    <span className="text-slate-300">/</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </nav>
                                )}

                                {title && (
                                    <div className="flex flex-col gap-0.5">
                                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                            {title}
                                        </h1>
                                        {subtitle && (
                                            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {headerActions}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
