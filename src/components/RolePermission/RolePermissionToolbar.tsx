import {
    Search,
    RefreshCw,
    ShieldCheck,
    Shield,
    UserCheck,
    Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserRole } from "./RoleSelector";

const roleConfig = {
    Administrator: {
        icon: ShieldCheck,
    },
    "Security Personnel": {
        icon: Shield,
    },
    "Authorized Staff": {
        icon: UserCheck,
    },
    "IT System Administrator": {
        icon: Settings2,
    },
} as const;

type RolePermissionToolbarProps = {
    search: string;
    setSearch: (value: string) => void;

    onRefresh: () => void;

    roles: UserRole[];
    selectedRole: UserRole;
    onSelectRole: (
        role: UserRole
    ) => void;
};
export default function RolePermissionToolbar({
    search,
    setSearch,
    onRefresh,
    roles,
    selectedRole,
    onSelectRole,
}: RolePermissionToolbarProps) {
    return (
        <div className="rounded border border-slate-200 bg-white shadow-sm">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                        <ShieldCheck className="h-6 w-6 text-orange-700" />
                    </div>

                    <div>

                        <h1 className="text-xl font-bold text-slate-900">
                            Role Permissions
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure which permissions are available for each
                            system role.
                        </p>

                    </div>

                </div>

                <div className="hidden flex-wrap gap-2">

                    <Button
                        variant="outline"
                        onClick={onRefresh}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>

                   
                </div>

            </div>

            {/* Search */}

            <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative max-w-md flex-1">

                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search permissions..."
                        className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
            "
                    />

                </div>

                <div className="flex flex-wrap gap-2">

                    {roles.map((role) => {
                        const Icon = roleConfig[role].icon;

                        const selected =
                            selectedRole === role;

                        return (
                            <Button
                                key={role}
                                type="button"
                                variant={
                                    selected
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    onSelectRole(role)
                                }
                                className={
                                    selected
                                        ? "bg-orange-700 hover:bg-orange-800"
                                        : ""
                                }
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {role}
                            </Button>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}