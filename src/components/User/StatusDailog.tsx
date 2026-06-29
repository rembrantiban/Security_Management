import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type StatusDialogProps = {
  open: boolean;
  type: "loading" | "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
};

export default function StatusDialog({
  open,
  type,
  title,
  message,
  onClose,
}: StatusDialogProps) {
  const loading = type === "loading";
  const success = type === "success";
  const error = type === "error";

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Content */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative w-full sm:max-w-md
            rounded-2xl
            border border-white/60
            bg-white/90
            backdrop-blur-xl
            shadow-2xl shadow-slate-900/10
            overflow-hidden
            animate-in zoom-in-95 fade-in duration-200
          "
        >    
          <div className="px-8 py-10">
            {/* ICON */}
            <div className="flex justify-center">
              {loading && (
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-40" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-50 to-amber-100 ring-1 ring-orange-100">
                    <Loader2 className="h-9 w-9 animate-spin text-orange-600" />
                  </div>
                </div>
              )}

              {success && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-50 to-green-100 ring-1 ring-emerald-100 animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.75} />
                </div>
              )}

              {error && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-50 to-rose-100 ring-1 ring-red-100 animate-in zoom-in duration-300">
                  <XCircle className="h-10 w-10 text-red-600" strokeWidth={1.75} />
                </div>
              )}
            </div>

            {/* TITLE */}
            <h2 className="mt-6 text-center text-xl font-semibold tracking-tight text-slate-900">
              {title}
            </h2>

            {/* MESSAGE */}
            <p className="mt-2.5 text-center text-sm leading-6 text-slate-500">
              {message}
            </p>

            {/* LOADING BAR */}
            {loading && (
              <div className="mt-8">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-linear-to-r from-orange-500 to-amber-500" />
                </div>
                <p className="mt-4 text-center text-xs font-medium text-slate-400">
                  Please wait...
                </p>
              </div>
            )}

            {/* BUTTON */}
            {!loading && (
              <Button
                onClick={onClose}
                className={`mt-8 w-full h-11 rounded-xl font-medium shadow-sm transition-all ${
                  success
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                }`}
              >
                {success ? "Continue" : "Try Again"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}