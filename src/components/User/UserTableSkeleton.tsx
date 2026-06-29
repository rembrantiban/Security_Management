import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export default function UserTableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-gray-100 border  border-gray-300 shadow">
          {/* User */}
          <TableCell>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>

          {/* Username */}
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>

          {/* Email */}
          <TableCell>
            <Skeleton className="h-4 w-52" />
          </TableCell>

          {/* Role */}
          <TableCell>
            <Skeleton className="h-7 w-32 rounded-full" />
          </TableCell>

          {/* Status */}
          <TableCell>
            <Skeleton className="h-7 w-24 rounded-full" />
          </TableCell>

          {/* Created */}
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>

          {/* Last Login */}
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>

          {/* Actions */}
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-9 w-9 rounded-xl" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}