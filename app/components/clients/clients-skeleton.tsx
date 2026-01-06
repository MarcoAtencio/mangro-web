import { BrandedLoader } from "~/components/ui/branded-loader";

/**
 * Loading skeleton for the Clients page.
 * Uses the branded loader with the Mangro logo for a premium experience.
 */
export function ClientsSkeleton() {
    return <BrandedLoader message="Cargando clientes..." />;
}
