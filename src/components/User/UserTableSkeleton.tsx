import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const headCell =
  "h-10 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400";

export default function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/50 shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className={`${headCell} w-65 px-5`}>User</TableHead>
              <TableHead className={headCell}>Email</TableHead>
              <TableHead className={headCell}>Role</TableHead>
              <TableHead className={headCell}>Status</TableHead>
              <TableHead className={headCell}>Approval</TableHead>
              <TableHead className={headCell}>Created</TableHead>
              <TableHead className={headCell}>Last Login</TableHead>
              <TableHead className={`${headCell} px-5 text-right`}>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-slate-100 hover:bg-transparent">

                {/* User */}
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="py-3">
                  <Skeleton className="h-3 w-44" />
                </TableCell>

                {/* Role */}
                <TableCell className="py-3">
                  <Skeleton className="h-5 w-28 rounded-md" />
                </TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </TableCell>

                {/* Approval */}
                <TableCell className="py-3">
                  <Skeleton className="h-5 w-24 rounded-md" />
                </TableCell>

                {/* Created */}
                <TableCell className="py-3">
                  <Skeleton className="h-3 w-32" />
                </TableCell>

                {/* Last Login */}
                <TableCell className="py-3">
                  <Skeleton className="h-3 w-32" />
                </TableCell>

                {/* Actions */}
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