import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminLayout } from "~/components/layout/admin-layout";

/**
 * Loading skeleton for the Services page.
 * Mimics the grid layout of stats cards, filters, and the services table
 * to reduce perceived load time and improve Speed Index.
 */
export function ServicesSkeleton() {
    return (
        <AdminLayout title="Gestión de Servicios" subtitle="Cargando servicios programados...">
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-slate-200/60 shadow-sm bg-white">
                            <CardContent className="p-3 sm:p-4 lg:p-5 flex items-start justify-between gap-2">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-3 w-16 bg-slate-100" />
                                    <Skeleton className="h-8 w-12 bg-slate-100" />
                                </div>
                                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-slate-100" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters Row Skeleton */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <Skeleton className="h-9 w-full sm:w-64 lg:w-80 bg-slate-100 rounded-md" />
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Skeleton className="h-9 w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 bg-slate-100 rounded-md" />
                            <Skeleton className="h-9 w-[calc(50%-0.25rem)] sm:w-40 lg:w-48 bg-slate-100 rounded-md" />
                            <Skeleton className="h-9 w-[calc(50%-0.25rem)] sm:w-36 lg:w-40 bg-slate-100 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Table Section Skeleton - Matching real page classes to prevent CLS */}
                <div className="flex flex-col -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-4 sm:py-5 lg:py-6 pb-6 lg:pb-8 bg-slate-100/70 flex-1 -mb-4 md:-mb-6 lg:-mb-8 border-t border-slate-200">
                    <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
                            <div className="bg-slate-50 border-b border-slate-200 p-4">
                                <div className="grid grid-cols-6 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Skeleton key={i} className="h-4 bg-slate-200/50 w-full" />
                                    ))}
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Skeleton className="h-4 w-24 bg-slate-100" />
                                        </div>
                                        <Skeleton className="h-4 w-48 bg-slate-100" />
                                        <Skeleton className="h-4 w-40 bg-slate-100 hidden md:block" />
                                        <Skeleton className="h-4 w-32 bg-slate-100 hidden sm:block" />
                                        <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
