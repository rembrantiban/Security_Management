import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const pageButton =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[12px] font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40";

export default function UserPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: Props) {
  const start = totalItems === 0
    ? 0
    : (currentPage - 1) * itemsPerPage + 1;

  const end = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  return (
    <div className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 sm:flex-row">

      <p className="text-[12px] text-slate-500">
        Showing{" "}
        <span className="font-semibold tabular-nums text-slate-700">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular-nums text-slate-700">
          {totalItems}
        </span>{" "}
        users
      </p>

      <div className="flex items-center gap-1">

        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${pageButton} text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-current={currentPage === i + 1 ? "page" : undefined}
            onClick={() => onPageChange(i + 1)}
            className={`${pageButton} ${
              currentPage === i + 1
                ? "bg-stone-900 text-white"
                : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${pageButton} text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50`}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

      </div>
    </div>
  );
}
