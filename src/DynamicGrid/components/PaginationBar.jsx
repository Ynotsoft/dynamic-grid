import React from "react";

export default function PaginationBar({
  pageIndex,
  setPageIndex,
  pageSize,
  totalResults,
}) {
  const totalPages = Math.ceil(totalResults / pageSize);
  const startPage = Math.max(0, pageIndex - 2);
  const endPage = Math.min(totalPages, pageIndex + 3);

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-gray-200 bg-white px-4 py-3">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{totalResults ? (pageIndex - 1) * pageSize + 1 : 0}</span>
          {" "}to{" "}
          <span className="font-medium">{Math.min(pageIndex * pageSize, totalResults)}</span>
          {" "}of{" "}
          <span className="font-medium">{totalResults}</span> results
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 1))}
          disabled={pageIndex === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages))}
          disabled={pageIndex === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{totalResults ? (pageIndex - 1) * pageSize + 1 : 0}</span>
          {" "}to{" "}
          <span className="font-medium">{Math.min(pageIndex * pageSize, totalResults)}</span>
          {" "}of{" "}
          <span className="font-medium">{totalResults}</span> results
        </p>

        {totalResults > pageSize ? (
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setPageIndex(1)}
              disabled={pageIndex === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
            >
              <span className="sr-only">First</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>

            {Array.from({ length: endPage - startPage }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPageIndex(startPage + idx + 1)}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                  pageIndex === startPage + idx + 1
                    ? "z-10 bg-primary text-white"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                }`}
              >
                {startPage + idx + 1}
              </button>
            ))}

            <button
              onClick={() => setPageIndex(totalPages)}
              disabled={pageIndex === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
            >
              <span className="sr-only">Last</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
