import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./use-pagination";

describe("usePagination", () => {
    describe("initialization", () => {
        it("should initialize with correct default values", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100 })
            );

            expect(result.current.currentPage).toBe(1);
            expect(result.current.totalPages).toBe(10);
            expect(result.current.startIndex).toBe(0);
            expect(result.current.endIndex).toBe(10);
            expect(result.current.itemsPerPage).toBe(10);
        });

        it("should respect custom itemsPerPage", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100, itemsPerPage: 20 })
            );

            expect(result.current.totalPages).toBe(5);
            expect(result.current.endIndex).toBe(20);
        });

        it("should respect custom initialPage", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100, initialPage: 3 })
            );

            expect(result.current.currentPage).toBe(3);
            expect(result.current.startIndex).toBe(20);
            expect(result.current.endIndex).toBe(30);
        });
    });

    describe("navigation", () => {
        it("should navigate to next page", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100 })
            );

            act(() => {
                result.current.nextPage();
            });

            expect(result.current.currentPage).toBe(2);
            expect(result.current.startIndex).toBe(10);
        });

        it("should navigate to previous page", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100, initialPage: 3 })
            );

            act(() => {
                result.current.prevPage();
            });

            expect(result.current.currentPage).toBe(2);
        });

        it("should not go below page 1", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100 })
            );

            act(() => {
                result.current.prevPage();
            });

            expect(result.current.currentPage).toBe(1);
        });

        it("should not exceed total pages", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 25, itemsPerPage: 10 })
            );

            // totalPages = 3
            act(() => {
                result.current.setPage(10);
            });

            expect(result.current.currentPage).toBe(3);
        });

        it("should handle setPage correctly", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 100 })
            );

            act(() => {
                result.current.setPage(5);
            });

            expect(result.current.currentPage).toBe(5);
            expect(result.current.startIndex).toBe(40);
            expect(result.current.endIndex).toBe(50);
        });
    });

    describe("edge cases", () => {
        it("should handle zero totalItems", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 0 })
            );

            expect(result.current.totalPages).toBe(0);
            expect(result.current.startIndex).toBe(0);
            expect(result.current.endIndex).toBe(0);
        });

        it("should handle last page with fewer items", () => {
            const { result } = renderHook(() =>
                usePagination({ totalItems: 25, itemsPerPage: 10, initialPage: 3 })
            );

            expect(result.current.startIndex).toBe(20);
            expect(result.current.endIndex).toBe(25); // Only 5 items on last page
        });
    });
});
