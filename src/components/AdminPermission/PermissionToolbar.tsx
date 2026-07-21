import {
  RefreshCw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IncidentToolbar = () => {
  return (
    <div className="rounded border bg-white border-gray-300  p-5 shadow-sm">

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Left Side */}

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">

          {/* Search */}

          <div className="relative w-full lg:max-w-sm">

            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

            <Input
              placeholder="Search incident or reference..."
              className="h-12 rounded-xl pl-10"
            />

          </div>

          {/* Severity */}

          <Select>

            <SelectTrigger className="h-12 w-full rounded-xl lg:w-48">

              <SelectValue placeholder="Severity" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="critical">
                Critical
              </SelectItem>

              <SelectItem value="high">
                High
              </SelectItem>

              <SelectItem value="moderate">
                Moderate
              </SelectItem>

              <SelectItem value="low">
                Low
              </SelectItem>

            </SelectContent>

          </Select>

          {/* Status */}

          <Select>

            <SelectTrigger className="h-12 w-full rounded-xl lg:w-48">

              <SelectValue placeholder="Status" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="open">
                Open
              </SelectItem>

              <SelectItem value="in-progress">
                In Progress
              </SelectItem>

              <SelectItem value="resolved">
                Resolved
              </SelectItem>

              <SelectItem value="closed">
                Closed
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

        {/* Right Side */}

        <div className="flex flex-wrap gap-3">

          <Button
            variant="outline"
            className="rounded-xl"
          >
            <RefreshCw className="mr-2 h-4 w-4" />

            Refresh

          </Button>
        </div>

      </div>

    </div>
  );
};

export default IncidentToolbar;