import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminLayout } from "~/components/layout/admin-layout";

/**
 * Loading skeleton for the Dashboard page.
 * Mimics the grid layout of stats cards and the recent services table
 * to reduce perceived load time and improve Speed Index.
 */
export function DashboardSkeleton() {
    return (
        <AdminLayout title="Panel de Control" subtitle="Cargando resumen de operaciones...">
            <div className="space-y-8">
                {/* Stats Grid Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-slate-200/60 shadow-sm bg-white">
                            <CardContent className="p-5 flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-3 w-20 bg-slate-100" />
                                    <Skeleton className="h-8 w-16 bg-slate-100" />
                                    <Skeleton className="h-3 w-32 bg-slate-100" />
                                </div>
                                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Services Skeleton */}
                    <Card className="shadow-md border-slate-200 lg:col-span-2 bg-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40 bg-slate-100" />
                                    <Skeleton className="h-3 w-60 bg-slate-100" />
                                </div>
                                <Skeleton className="h-8 w-20 bg-slate-100 hidden sm:block" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32 bg-slate-100" />
                                            <Skeleton className="h-3 w-48 bg-slate-100 sm:hidden" />
                                        </div>
                                        <Skeleton className="h-4 w-40 bg-slate-100 hidden md:block" />
                                        <Skeleton className="h-4 w-24 bg-slate-100 hidden sm:block" />
                                        <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Card Skeleton */}
                    <Card className="shadow-md border-slate-200 bg-white">
                        <CardHeader>
                            <Skeleton className="h-5 w-32 bg-slate-100" />
                            <Skeleton className="h-3 w-48 bg-slate-100" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-32 bg-slate-100" />
                                    <Skeleton className="h-4 w-8 bg-slate-100" />
                                </div>
                                <Skeleton className="h-2 w-full bg-slate-50" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50">
                                        <Skeleton className="h-5 w-5 rounded bg-slate-100" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-24 bg-slate-100" />
                                            <Skeleton className="h-4 w-32 bg-slate-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
