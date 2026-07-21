import { Check, KeyRound } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import type { Permission } from "@/store/usePermissionsStore";

type PermissionCardProps = {
    permission: Permission;
    checked: boolean;
    onToggle: () => void;
};

export default function PermissionCard({
    permission,
    checked,
    onToggle,
}: PermissionCardProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
                w-full
                rounded-xl
                border
                p-4
                text-left
                transition-all
                hover:shadow-md
                ${
                    checked
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-white hover:border-orange-200"
                }
            `}
        >
            <div className="flex items-start justify-between">

                <div className="flex items-start gap-3">

                    <div
                        className={`
                            mt-0.5
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            ${
                                checked
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-100 text-slate-500"
                            }
                        `}
                    >
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div>

                        <h4 className="font-medium text-slate-900">
                            {permission.permission_name}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                            {permission.module_name}
                        </p>

                    </div>

                </div>

                <Checkbox
                    checked={checked}
                    onCheckedChange={onToggle}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                />

            </div>

            {checked && (
                <div className="mt-4 flex items-center gap-2 border-t border-orange-200 pt-3 text-xs font-medium text-orange-700">
                    <Check className="h-3.5 w-3.5" />
                    Permission Granted
                </div>
            )}
        </button>
    );
}