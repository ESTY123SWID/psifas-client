import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    label?: string;
}

/** ניווט בין עמודים (RTL: "הקודם" מימין, "הבא" משמאל). */
function Pagination({ page, totalPages, isLoading = false, onPageChange, label = "ניווט בין עמודים" }: PaginationProps) {
    if (totalPages <= 1) return null;
    return (
        <nav aria-label={label} className="mt-8 flex items-center justify-center gap-2">
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
            >
                <ChevronRight size={16} aria-hidden="true" />
                הקודם
            </button>
            <span className="min-w-28 text-center text-sm font-semibold text-ink-soft tabular-nums">
                עמוד {page} מתוך {totalPages}
            </span>
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
            >
                הבא
                <ChevronLeft size={16} aria-hidden="true" />
            </button>
        </nav>
    );
}

export default Pagination;
