import { BrandedLoader } from "~/components/ui/branded-loader";

/**
 * Loading skeleton for the Users (Technicians) page.
 * Uses the branded loader with the Mangro logo for a premium experience.
 */
export function UsersSkeleton() {
    return <BrandedLoader message="Cargando usuarios..." />;
}
