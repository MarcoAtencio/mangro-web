import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminLayout } from "~/components/layout/admin-layout";

/**
 * Loading skeleton for the Clients page.
 * Mimics the grid layout of stats cards and the clients table
 * to reduce perceived load time and improve Speed Index.
 */
export function ClientsSkeleton() {
    return (
        <AdminLayout title="Gestión de Clientes" subtitle="Cargando cartera de clientes...">
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

                {/* Filters Section Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Skeleton className="h-9 w-full sm:w-72 bg-slate-100 rounded-md" />
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Skeleton className="h-9 w-24 bg-slate-100 rounded-md" />
                        <Skeleton className="h-9 w-24 bg-slate-100 rounded-md" />
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="hidden sm:flex flex-col border border-slate-200 rounded-md bg-white overflow-hidden">
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
                                    <Skeleton className="h-9 w-9 rounded-lg bg-slate-100" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-slate-100" />
                                        <Skeleton className="h-3 w-20 bg-slate-100" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-48 bg-slate-100 hidden sm:block" />
                                <Skeleton className="h-4 w-32 bg-slate-100 hidden md:block" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                                    <Skeleton className="h-8 w-8 rounded-full bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile List Skeleton */}
                <div className="sm:hidden space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg bg-slate-100" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40 bg-slate-100" />
                                    <Skeleton className="h-3 w-24 bg-slate-100" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full bg-slate-50" />
                            <div className="flex justify-between pt-2">
                                <Skeleton className="h-4 w-20 bg-slate-50" />
                                <Skeleton className="h-4 w-20 bg-slate-50" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
