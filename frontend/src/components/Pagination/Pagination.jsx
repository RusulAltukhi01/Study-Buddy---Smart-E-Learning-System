import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Build page numbers with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("ellipsis-" + p);
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="w-full flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      <span className="text-sm text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-600">{start}–{end}</span>{" "}
        of{" "}
        <span className="font-semibold text-gray-600">{totalItems}</span>{" "}
        classes
      </span>

      <div className="flex items-center gap-1 ">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((item) =>
          typeof item === "string" ? (
            <span key={item} className="w-8 text-center text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              style={
                currentPage === item
                  ? { background: "linear-gradient(135deg, #2DD4BF, #10B981)", color: "white" }
                  : { color: "#6B7280" }
              }
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
