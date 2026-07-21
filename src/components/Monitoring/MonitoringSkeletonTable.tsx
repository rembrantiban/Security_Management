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

export default function MonitoringTableSkeleton({ rows = 5 }: Props) {
    return (
        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">

            <Table>

                <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead>Personnel</TableHead>
                        <TableHead>Assigned Area</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duty Schedule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-transparent">

                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3.5 w-28 rounded" />
                                        <Skeleton className="h-3 w-16 rounded" />
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
                                    <Skeleton className="h-3.5 w-24 rounded" />
                                </div>
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-3.5 w-28 rounded" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-3.5 w-32 rounded" />
                            </TableCell>

                            <TableCell>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </TableCell>

                            <TableCell className="text-right">
                                <Skeleton className="ml-auto h-8 w-8 rounded-lg" />
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>

            </Table>

        </div>
    );
}