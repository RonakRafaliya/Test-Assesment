import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for pagination logic
 * Responsibility: Handle pagination calculations and URL syn
 */

type UsePaginationProps = {
  totalItems: number;
  itemsPerPage: number;
};

export const usePagination = ({ totalItems, itemsPerPage }: UsePaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(1, pageFromUrl), totalPages);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    if (totalPages > 0 && pageFromUrl > totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    }
  }, [pageFromUrl, totalPages, searchParams, setSearchParams]);

  const goToPage = (pageNumber: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNumber.toString());
    setSearchParams(newParams, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
  };
};

