import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    rows?: number;
}

const headCell =
    "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

export default function MonitoringTableSkeleton({ rows = 5 }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className={`${headCell} px-5`}>Personnel</TableHead>
                            <TableHead className={headCell}>Assigned Area</TableHead>
                            <TableHead className={headCell}>Date</TableHead>
                            <TableHead className={headCell}>Duty Schedule</TableHead>
                            <TableHead className={headCell}>Status</TableHead>
                            <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {Array.from({ length: rows }).map((_, i) => (
                            <TableRow key={i} className="border-slate-100 hover:bg-transparent">

                                <TableCell className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-3 w-28" />
                                            <Skeleton className="h-2.5 w-16" />
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="py-3">
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </TableCell>

                                <TableCell className="py-3">
                                    <Skeleton className="h-3 w-24" />
                                </TableCell>

                                <TableCell className="py-3">
                                    <Skeleton className="h-3 w-32" />
                                </TableCell>

                                <TableCell className="py-3">
                                    <Skeleton className="h-5 w-24 rounded-md" />
                                </TableCell>

                                <TableCell className="px-5 py-3 text-right">
                                    <Skeleton className="ml-auto h-7 w-7 rounded-lg" />
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}