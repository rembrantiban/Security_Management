import { ShieldOff, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyRolePermissionsProps = {
    onRefresh?: () => void;
};

export default function EmptyRolePermissions({
    onRefresh,
}: EmptyRolePermissionsProps) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-20">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                    <ShieldOff className="h-10 w-10 text-orange-700" />
                </div>

                <h2 className="mt-6 text-xl font-semibold text-slate-900">
                    No Permissions Found
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    There are currently no permissions available to assign.
                    Create permissions first before configuring access for
                    each role.
                </p>

                {onRefresh && (
                    <Button
                        onClick={onRefresh}
                        className="mt-8 bg-orange-700 hover:bg-orange-800"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                )}

            </div>
        </div>
    );
}