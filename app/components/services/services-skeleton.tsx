import { BrandedLoader } from "~/components/ui/branded-loader";

/**
 * Loading skeleton for the Services page.
 * Uses the branded loader with the Mangro logo for a premium experience.
 */
export function ServicesSkeleton() {
    return <BrandedLoader message="Cargando servicios..." />;
}
