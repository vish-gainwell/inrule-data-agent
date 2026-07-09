import React, { useEffect, useState } from 'react';

const ResultsTable = ({ execution }) => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [execution?.columns, execution?.rows, execution?.isPreview]);

  if (!execution || !execution.columns?.length) return null;

  const { columns, rows, isPreview } = execution;

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const visibleRows = rows.slice(startIdx, endIdx);

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value) || 10;
    setPageSize(newSize);
    setPage(1);
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  const downloadCsv = () => {
    const escapeCell = (value) => {
      if (value == null) return '';
      const s = String(value);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headerLine = columns.map(escapeCell).join(',');
    const rowLines = rows.map((row) => columns.map((col) => escapeCell(row[col])).join(','));
    const csvContent = [headerLine, ...rowLines].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isPreview ? 'preview_results.csv' : 'query_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
        <div>
          {isPreview
            ? 'Preview results (showing up to 10 rows - backend limited).'
            : 'Full execution results (up to backend limit).'}
          {totalRows > 0 && (
            <span className="ml-2 text-gray-500">
              {totalRows} row{totalRows !== 1 ? 's' : ''} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-80">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-semibold text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-1 text-gray-800">
                    {row[col] ?? ''}
                  </td>
                ))}
              </tr>
            ))}

            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length || 1} className="px-3 py-2 text-gray-500 italic">
                  No rows returned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select value={pageSize} onChange={handlePageSizeChange} className="border rounded px-1 py-0.5">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
