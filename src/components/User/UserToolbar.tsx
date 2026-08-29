import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCcw, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  role: string;
  onRoleChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  onRefresh: () => void;
};

export default function UserToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onRefresh,
}: Props) {
  return (
    <div className="rounded-2xl bg-white/50 p-3 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search by name, username, or email"
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={role}
            onValueChange={(value) => {
              if (value) {
                onRoleChange(value);
              }
            }}
          >
            <SelectTrigger className="h-9 w-40 rounded-xl border-0 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300">
              <SelectValue placeholder="Role" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-[12.5px]">
                All roles
              </SelectItem>
              <SelectItem value="Authorized Staff" className="text-[12.5px]">
                Authorized Staff
              </SelectItem>
              <SelectItem value="Security Personnel" className="text-[12.5px]">
                Security Personnel
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => {
              if (value) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="h-9 w-36 rounded-xl border-0 text-[12.5px] ring-1 ring-slate-200 focus:ring-amber-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-[12.5px]">
                All status
              </SelectItem>
              <SelectItem value="active" className="text-[12.5px]">
                Active
              </SelectItem>
              <SelectItem value="disabled" className="text-[12.5px]">
                Deactivated
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={onRefresh}
            variant="ghost"
            className="h-9 gap-1.5 rounded-xl px-3 text-[12.5px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

      </div>
    </div>
  );
}