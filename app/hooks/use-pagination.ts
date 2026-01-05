import { useState } from "react";

/**
 * Props for the usePagination hook.
 */
interface UsePaginationProps {
    /** Total number of items to paginate */
    totalItems: number;
    /** Number of items to display per page (default: 10) */
    itemsPerPage?: number;
    /** Initial page number (default: 1) */
    initialPage?: number;
}

/**
 * Return type for the usePagination hook.
 */
interface UsePaginationReturn {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Start index for slicing items array */
    startIndex: number;
    /** End index for slicing items array (exclusive) */
    endIndex: number;
    /** Navigate to the next page */
    nextPage: () => void;
    /** Navigate to the previous page */
    prevPage: () => void;
    /** Navigate to a specific page */
    setPage: (page: number) => void;
    /** Items displayed per page */
    itemsPerPage: number;
}

/**
 * Custom hook for managing pagination state and navigation.
 * Provides all necessary state and functions for implementing pagination UI.
 * 
 * @param props - Configuration options for pagination
 * @returns Pagination state and navigation functions
 * 
 * @example
 * ```tsx
 * const { currentPage, totalPages, startIndex, endIndex, nextPage, prevPage } = usePagination({
 *     totalItems: items.length,
 *     itemsPerPage: 10,
 * });
 * 
 * const paginatedItems = items.slice(startIndex, endIndex);
 * ```
 */
export function usePagination({
    totalItems,
    itemsPerPage = 10,
    initialPage = 1,
}: UsePaginationProps): UsePaginationReturn {
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

