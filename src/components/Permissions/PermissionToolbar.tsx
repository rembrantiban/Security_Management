import {
    Plus,
    Search,
    RefreshCw,
    ShieldCheck,
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

type PermissionToolbarProps = {
    search: string;
    setSearch: (value: string) => void;

    moduleFilter: string;
    setModuleFilter: (value: string | null) => void;

    modules: string[];

    totalPermissions: number;

    onRefresh: () => void;

    onAdd: () => void;
};

export default function PermissionToolbar({
    search,
    setSearch,
    moduleFilter,
    setModuleFilter,
    modules,
    totalPermissions,
    onRefresh,
    onAdd,
}: PermissionToolbarProps) {
    return (
        <div className="rounded border border-slate-200 bg-white shadow-sm">

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                        <ShieldCheck className="h-7 w-7 text-orange-700" />
                    </div>

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                            System Administration
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            Permissions
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage system permissions used by the
                            Role-Based Access Control (RBAC) module.
                        </p>

                    </div>

                </div>

                <Button
                    onClick={onAdd}
                    className="bg-orange-700 hover:bg-orange-800"
                >
                    <Plus className="mr-2 h-4 w-4" />

                    New Permission
                </Button>

            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex flex-1 flex-col gap-3 md:flex-row">

                    {/* Search */}

                    <div className="relative flex-1">

                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                        <Input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search permission..."
                            className="pl-10"
                        />

                    </div>

                    {/* Filter */}

                    <Select
                        value={moduleFilter}
                        onValueChange={setModuleFilter}
                    >
                        <SelectTrigger className="w-full md:w-60">

                            <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                            {modules.map((module) => (
                                <SelectItem
                                    key={module}
                                    value={module}
                                >
                                    {module}
                                </SelectItem>
                            ))}

                        </SelectContent>

                    </Select>

                </div>

                <div className="flex items-center gap-3">

                    <div className="rounded-lg border bg-slate-50 px-4 py-2">

                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Total Permissions
                        </p>

                        <p className="text-lg font-bold text-orange-700">
                            {totalPermissions}
                        </p>

                    </div>

                    <Button
                        variant="outline"
                        onClick={onRefresh}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />

                        Refresh
                    </Button>

                </div>

            </div>

        </div>
    );
}