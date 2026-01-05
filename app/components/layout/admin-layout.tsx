import React, { useState } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { cn } from "~/lib/utils";

import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headerActions?: React.ReactNode;
    breadcrumb?: { label: string; href?: string }[];
    backButton?: { href: string; label?: string };
}

export function AdminLayout({
    children,
    title,
    subtitle,
    headerActions,
    breadcrumb,
    backButton
}: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Desktop Sidebar - visible only on lg and up (iPad Landscape/Laptop) */}
            <div className="hidden lg:block">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </div>

            <main
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 min-h-screen",
                    collapsed ? "lg:ml-16" : "lg:ml-64"
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 py-3 md:py-4 bg-slate-50 px-4 md:px-6 lg:px-8">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <MobileSidebar />
                            
                            {backButton && (
                                <Link 
                                    to={backButton.href} 
                                    className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                                    aria-label={backButton.label ? `Go back to ${backButton.label}` : "Go back"}
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    {backButton.label && <span>{backButton.label}</span>}
                                </Link>
                            )}
                            
                            <div className="flex flex-col gap-0.5">
                                {/* Breadcrumbs */}
                                {breadcrumb && (
                                    <nav className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                                        {breadcrumb.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                {item.href ? (
                                                    <Link to={item.href} className="hover:text-primary transition-colors">
                                                        {item.label}
                                                    </Link>
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
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                                {title}
                                            </h1>
                                        </div>
                                        {subtitle && (
                                            <div className="text-xs sm:text-sm text-slate-500 hidden sm:block font-medium">
                                                {subtitle}
                                            </div>
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
