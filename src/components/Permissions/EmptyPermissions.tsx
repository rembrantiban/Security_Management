import { ShieldAlert } from "lucide-react";

type EmptyPermissionsProps = {
    onCreate: () => void;
};

export default function EmptyPermissions({ onCreate }: EmptyPermissionsProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white py-16 ring-0">
            <div className="flex flex-col items-center justify-center text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                    <ShieldAlert className="h-8 w-8 text-orange-600" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                    No Permissions Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    No permissions have been created yet.
                    Create permissions to define what actions users
                    can perform across the system.
                </p>

                <button
                    onClick={onCreate}
                    className="mt-4 rounded-md text-sm  bg-orange-800 px-2 py-2 text-white hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  +  Create Permission
                </button>

            </div>
        </div>
    );
}