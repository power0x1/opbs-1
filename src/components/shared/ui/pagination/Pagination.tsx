import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
  loading?: boolean;
  showFirstLast?: boolean;
}

function pageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push('ellipsis');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
  loading = false,
  showFirstLast = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageRange(currentPage, totalPages);
  const disabled = loading;

  return (
    <nav className={`pagination ${disabled ? 'pagination-loading' : ''}`} aria-label="Pagination">
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-[#3b3530] bg-[#181818] text-[#ccd3e2] hover:border-[#ff7a3d] hover:text-[#ff7a3d]"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || disabled}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-[#3b3530] bg-[#181818] text-[#ccd3e2] hover:border-[#ff7a3d] hover:text-[#ff7a3d]"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="pagination-pages">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="pagination-ellipsis">…</span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? 'outline' : 'ghost'}
              size="icon"
              className={
                p === currentPage
                  ? 'h-9 min-w-9 border-[#ff7a3d] bg-[#ff7a3d]/10 text-[#ff7a3d]'
                  : 'h-9 min-w-9 border border-[#3b3530] bg-[#181818] text-[#ccd3e2] hover:border-[#ff7a3d] hover:text-[#ff7a3d]'
              }
              onClick={() => onPageChange(p)}
              disabled={disabled}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage}
            >
              {p}
            </Button>
          ),
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 border-[#3b3530] bg-[#181818] text-[#ccd3e2] hover:border-[#ff7a3d] hover:text-[#ff7a3d]"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-[#3b3530] bg-[#181818] text-[#ccd3e2] hover:border-[#ff7a3d] hover:text-[#ff7a3d]"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
      {totalRecords != null && pageSize != null && (
        <span className="pagination-info">
          {totalRecords} records · {pageSize}/page
        </span>
      )}
    </nav>
  );
}

