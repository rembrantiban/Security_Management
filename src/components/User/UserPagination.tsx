import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

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
    <div className="flex flex-col items-center justify-between gap-4 rounded border border-gray-300 bg-white p-5 shadow-sm md:flex-row">

      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {totalItems}
        </span>{" "}
        users
      </p>

      <div className="flex items-center gap-2">

        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
        >
          Previous
        </Button>

        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={
              currentPage === i + 1
                ? "default"
                : "outline"
            }
            onClick={() =>
              onPageChange(i + 1)
            }
          >
            {i + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(currentPage + 1)
          }
        >
          Next
        </Button>

      </div>
    </div>
  );
}