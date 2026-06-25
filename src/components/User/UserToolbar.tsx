import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  RefreshCcw,
} from "lucide-react";

export default function UserToolbar() {
  return (
    <div className="rounded border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-3.5 h- w-5 text-slate-400" />

          <Input
            placeholder="Search users..."
            className="h-12 rounded-xl pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button variant="outline" className="rounded-xl">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}