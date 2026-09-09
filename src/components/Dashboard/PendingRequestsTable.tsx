import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Eye,
  CalendarDays,
  Clock3,
  Users,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

import { useRequest } from "@/hooks/useRequest";
import type { RequestAccess } from "@/store/useRequestStore";

/** Rows shown per page. */
const PAGE_SIZE = 2;

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
  const navigate = useNavigate();
  const { pendingRequests } = useRequest();

  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(pendingRequests.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const paged = useMemo(
    () =>
      pendingRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [pendingRequests, page]
  );

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
          onClick={() => navigate("/access")}
          className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-medium text-amber-800 hover:bg-amber-50 hover:text-amber-900"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {pendingRequests.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
              <Inbox className="h-5 w-5 text-amber-800" />
            </div>

            <p className="mt-3 text-[13px] font-medium text-slate-700">
              No pending requests
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Visitor requests awaiting approval will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-2 p-3">
              {paged.map((request) => (
                <div
                  key={request.request_id}
                  className="flex flex-col gap-3 rounded-xl bg-white/70 p-3.5 ring-1 ring-slate-200 transition-colors duration-200 hover:ring-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-800 text-[11px] font-semibold text-amber-50 ring-1 ring-amber-900/10">
                      {getInitials(request)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-none text-slate-900">
                        {fullName(request)}
                      </p>
                      <p className="mt-1 truncate font-mono text-[11px] tracking-tight text-slate-500">
                        {request.request_number}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <span className="truncate text-[12.5px] text-slate-600">
                      {request.purpose}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] tabular-nums text-slate-700">
                      <Clock3 className="h-3 w-3" />
                      Waiting {waitingSince(request.created_at)}
                    </span>

                    <Button
                      size="sm"
                      className="h-7 gap-1.5 rounded-lg bg-amber-800 px-3 text-[11px] font-medium text-white shadow-sm hover:bg-amber-900"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
              <p className="text-[11px] tabular-nums text-slate-400">
                {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, pendingRequests.length)} of{" "}
                {pendingRequests.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                <span className="px-2 text-[11px] tabular-nums text-slate-500">
                  Page {page} of {pageCount}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                  className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
