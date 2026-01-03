import { useState } from "react";

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage?: number;
    initialPage?: number;
}

export function usePagination({
    totalItems,
    itemsPerPage = 10,
    initialPage = 1,
}: UsePaginationProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Reset to page 1 if totalItems changes (e.g. storage filter applied)
    // We purposefully removed the useEffect that auto-resets page to avoid "set state in effect" errors.
    // The parent component should handle resetting page when filters change.

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const setPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        nextPage,
        prevPage,
        setPage,
        itemsPerPage
    };
}
