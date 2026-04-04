import { useState, useMemo, useEffect, useRef } from "react";

interface UseTablePaginationOptions {
  defaultPageSize?: number;
}

export function useTablePagination<T>(data: T[], options?: UseTablePaginationOptions) {
  const { defaultPageSize = 20 } = options || {};
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset page when data or pageSize changes
  const prevDataRef = useRef(data);
  const prevPageSizeRef = useRef(pageSize);

  useEffect(() => {
    if (prevDataRef.current !== data || prevPageSizeRef.current !== pageSize) {
      setCurrentPage(1);
      prevDataRef.current = data;
      prevPageSizeRef.current = pageSize;
    }
  }, [data, pageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  return {
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    totalItems: data.length,
  };
}
