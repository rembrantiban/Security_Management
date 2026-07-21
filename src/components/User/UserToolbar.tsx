import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCcw,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  role: string;
  onRoleChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  onRefresh: () => void;
};

export default function UserToolbar({ search, onSearchChange, role, onRoleChange, status, onStatusChange, onRefresh }: Props) {
  return (
    <div className="rounded border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />

          <Input
            placeholder="Search users..."
            className="h-10 rounded-xl pl-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
        <Select
          value={role}
          onValueChange={(value) => {
            if (value) {
              onRoleChange(value);
            }
          }}
        >
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue placeholder="Role" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Roles
            </SelectItem>

            <SelectItem value="Authorized Staff">
              Authorized Staff
            </SelectItem>

            <SelectItem value="Security Personnel">
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
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Status
            </SelectItem>

            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="disabled">
              Deactivated
            </SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onRefresh} variant="outline" className="rounded-xl">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        </div>
      </div>
    </div>
  );
}