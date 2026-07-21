 import { Button } from "@/components/ui/button";

type PermissionPaginationProps = {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    totalItems: number;

    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
};

export default function PermissionPagination({
    currentPage,
    totalPages,
    rowsPerPage,
    totalItems,
    onPageChange,
    onRowsPerPageChange,
}: PermissionPaginationProps) {
    return (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                {/* Left */}
                <div className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                        {totalItems === 0
                            ? 0
                            : (currentPage - 1) * rowsPerPage + 1}
                    </span>

                    {" "}to{" "}

                    <span className="font-semibold text-slate-800">
                        {Math.min(currentPage * rowsPerPage, totalItems)}
                    </span>

                    {" "}of{" "}

                    <span className="font-semibold text-slate-800">
                        {totalItems}
                    </span>{" "}
                    permissions
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">

                    <div className="flex items-center gap-2">

                        <span className="text-sm text-slate-500">
                            Rows
                        </span>

                        <select
                            value={rowsPerPage}
                            onChange={(e) =>
                                onRowsPerPageChange(
                                    Number(e.target.value)
                                )
                            }
                            className="
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-1.5
                                text-sm
                                shadow-sm
                                outline-none
                            "
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>

                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() =>
                            onPageChange(currentPage - 1)
                        }
                    >
                        Previous
                    </Button>

                    <span
                        className="
                            rounded-md
                            border
                            bg-white
                            px-3
                            py-1
                            text-sm
                            font-medium
                            shadow-sm
                        "
                    >
                        {currentPage} / {totalPages || 1}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={
                            currentPage === totalPages ||
                            totalPages === 0
                        }
                        onClick={() =>
                            onPageChange(currentPage + 1)
                        }
                    >
                        Next
                    </Button>

                </div>
            </div>
        </div>
    );
}