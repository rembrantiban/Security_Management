import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Eye,
  CalendarDays,
  Clock3,
  Users,
  ChevronRight,
  Inbox,
} from "lucide-react";

import { useRequest } from "@/hooks/useRequest";
import type { RequestAccess } from "@/store/useRequestStore";

function fullName(r: RequestAccess) {
  return [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");
}

function getInitials(r: RequestAccess) {
  return [r.first_name, r.last_name]
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function waitingSince(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));

  if (mins < 60) return `${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
}

export default function PendingRequestsTable() {
  const { pendingRequests } = useRequest();

  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white/50 shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
            <Users className="h-4 w-4 text-amber-800" />
          </div>

          <div>
            <p className="text-[13px] font-semibold tracking-tight text-slate-900">
              Pending Requests
            </p>
            <p className="mt-0.5 text-[11px] text-slate-800">
              Visitor requests awaiting approval
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-85">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="h-9 px-5 text-[10px] font-medium uppercase tracking-widest text-slate-700">
                  Visitor
                </TableHead>
                <TableHead className="h-9 text-[10px] font-medium uppercase tracking-widest text-slate-700">
                  Purpose
                </TableHead>
                <TableHead className="h-9 text-[10px] font-medium uppercase tracking-widest text-slate-700">
                  Status
                </TableHead>
                <TableHead className="h-9 text-[10px] font-medium uppercase tracking-widest text-slate-700">
                  Waiting
                </TableHead>
                <TableHead className="h-9 px-5 text-right text-[10px] font-medium uppercase tracking-widest text-slate-700">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow
                  key={request.request_id}
                  className="border-slate-100 transition-colors duration-200 hover:bg-slate-50"
                >
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                        {getInitials(request)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                          {fullName(request)}
                        </p>
                        <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-slate-500">
                          {request.request_number}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="truncate text-[13px] text-slate-600">
                        {request.purpose}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {request.status}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-slate-700">
                      <Clock3 className="h-3 w-3" />
                      {waitingSince(request.created_at)}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      className="h-7 gap-1.5 rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-amber-900"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {pendingRequests.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                      <Inbox className="h-5 w-5 text-amber-800" />
                    </div>

                    <p className="mt-3 text-[13px] font-medium text-slate-700">
                      No pending requests
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Visitor requests awaiting approval will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
