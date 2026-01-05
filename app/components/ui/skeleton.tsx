import { cn } from "~/lib/utils";

/**
 * Basic skeleton component for loading states.
 * Used to build complex loading patterns like the DashboardSkeleton.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      {...props}
    />
  );
}

export { Skeleton };
