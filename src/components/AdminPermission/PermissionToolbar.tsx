import { RefreshCw, Search, Archive, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IncidentToolbarProps = {
  onViewArchived?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  severity: string;
  onSeverityChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
};

const triggerClass =
  "h-9 w-full rounded-xl border-0 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300 lg:w-40";

const itemClass = "text-[12.5px]";

const IncidentToolbar = ({
  onViewArchived,
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
}: IncidentToolbarProps) => {

  const hasFilters =
    search.trim() !== "" || severity !== "all" || status !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onSeverityChange("all");
    onStatusChange("all");
  };

  return (
    <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">

      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">

        {/* Filters */}
        <div className="flex flex-1 flex-col gap-2.5 lg:flex-row lg:items-center">

          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search by title, reference, location, or category"
              className="h-9 rounded-xl border-0 bg-slate-50 pl-9 pr-8 text-[12.5px] ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-amber-300"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Severity */}
          <Select
            value={severity}
            onValueChange={(value) => {
              if (value) {
                onSeverityChange(value);
              }
            }}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all" className={itemClass}>
                All severity
              </SelectItem>
              <SelectItem value="Critical" className={itemClass}>
                Critical
              </SelectItem>
              <SelectItem value="High" className={itemClass}>
                High
              </SelectItem>
              <SelectItem value="Medium" className={itemClass}>
                Medium
              </SelectItem>
              <SelectItem value="Low" className={itemClass}>
                Low
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={status}
            onValueChange={(value) => {
              if (value) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all" className={itemClass}>
                All status
              </SelectItem>
              <SelectItem value="Pending" className={itemClass}>
                Pending
              </SelectItem>
              <SelectItem value="In Progress" className={itemClass}>
                In Progress
              </SelectItem>
              <SelectItem value="Resolved" className={itemClass}>
                Resolved
              </SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl px-2.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}

        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">

          <Button
            variant="ghost"
            onClick={onViewArchived}
            className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            <Archive className="h-3.5 w-3.5" />
            View archived
          </Button>

          <Button
            variant="ghost"
            className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

        </div>

      </div>

    </div>
  );
};

export default IncidentToolbar;