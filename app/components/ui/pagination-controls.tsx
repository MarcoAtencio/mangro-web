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
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4 bg-white border border-slate-200 rounded-lg shadow-sm mt-4 ${className || ""}`}>
            {/* Info Text */}
            <div className="text-sm text-slate-500 text-center sm:text-left order-2 sm:order-1 w-full sm:w-auto">
                Mostrando <span className="font-medium text-slate-900">{startItem}-{endItem}</span> de <span className="font-medium text-slate-900">{totalItems}</span> {itemName}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-9 sm:h-9 px-3 lg:px-4 gap-2 min-w-[32px] sm:min-w-[100px]"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Anterior</span>
                </Button>

                {/* Mobile Page Indicator */}
                <div className="flex items-center gap-1.5 text-sm font-medium sm:hidden">
                    <span>{currentPage}</span>
                    <span className="text-slate-300">/</span>
                    <span>{totalPages}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 sm:h-9 px-3 lg:px-4 gap-2 min-w-[32px] sm:min-w-[100px]"
                    aria-label="Próxima página"
                >
                    <span className="sr-only sm:not-sr-only">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
