import { PaginationInfo } from '../types/task';

type PaginationProps = {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing page {page} of {totalPages} ({total} total tasks)
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <div className="pagination-numbers">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum as number)}
                className={`pagination-number ${page === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

