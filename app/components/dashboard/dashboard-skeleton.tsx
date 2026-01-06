import { BrandedLoader } from "~/components/ui/branded-loader";

/**
 * Loading skeleton for the Dashboard page.
 * Uses the branded loader with the Mangro logo for a premium experience.
 */
export function DashboardSkeleton() {
    return <BrandedLoader message="Cargando panel de control..." />;
}
