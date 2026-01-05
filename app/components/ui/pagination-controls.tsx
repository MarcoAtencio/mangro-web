import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemName?: string;
    className?: string;
}

export function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemName = "elementos",
    className,
}: PaginationControlsProps) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 pb-2 px-2 sm:px-0 border-t border-slate-100 mt-3 sm:mt-4 ${className || ""}`}>
            <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                <span className="hidden sm:inline">Mostrando {startItem} a {endItem} de </span>
                <span className="sm:hidden">{startItem}-{endItem} / </span>
                {totalItems} {itemName}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="gap-1 h-8 px-2 sm:px-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                </Button>
                <div className="flex items-center gap-1 px-1 sm:px-2">
                    <span className="text-xs sm:text-sm font-medium">{currentPage}</span>
                    <span className="text-muted-foreground text-xs sm:text-sm">/</span>
                    <span className="text-xs sm:text-sm font-medium">{totalPages}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1 h-8 px-2 sm:px-3"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
