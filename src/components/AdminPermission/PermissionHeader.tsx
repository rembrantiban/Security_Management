import { ShieldCheck } from "lucide-react";

const PermissionHeader = () => {
  return (
    <div className="relative overflow-hidden rounded border bg-white shadow-sm">

      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-r border border-gray-300 from-orange-50 via-white to-orange-100 opacity-70" />

      <div className="relative flex flex-col gap-6 p-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-linear-to-br from-orange-800 to-amber-700 text-white shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Incident
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Configure administrator access for the
              <span className="font-semibold text-orange-600">
                {" "}Incident Reporting & Management{" "}
              </span>
              module. Manage permissions, monitor access rights,
              and maintain secure administrative operations.
            </p>

          </div>

        </div>

        {/* Right */}

      </div>
    </div>
  );
};

export default PermissionHeader;