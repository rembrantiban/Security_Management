import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  Shield,
  Trash2,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { MonitoringSchedule } from "@/store/useMonitoringStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading?: boolean;
  schedule: MonitoringSchedule | null;
}

export default function DeleteMonitoringModal({
  open,
  onClose,
  onDelete,
  loading = false,
  schedule,
}: Props) {
  if (!schedule) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-sm p-0 overflow-hidden">

        {/* Header */}

        <DialogHeader className="border-b bg-orange-50/60 px-6 py-5">

          <div className="flex items-start justify-between">

            <div className="flex gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">

                <Trash2 className="h-6 w-6 text-red-600" />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Delete Monitoring Schedule
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This action cannot be undone.
                </p>

              </div>

            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>

          </div>

        </DialogHeader>

        {/* Body */}

        <div className="space-y-5 px-6 py-5">

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex gap-3">

              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />

              <div>

                <h4 className="font-medium text-red-700">
                  Warning
                </h4>

                <p className="mt-1 text-sm text-red-600">
                  Deleting this monitoring schedule will permanently remove
                  it from the system.
                </p>

              </div>

            </div>

          </div>

          {/* Schedule Summary */}

          <div className="rounded-xl border bg-slate-50">

            <div className="border-b px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">

                  <Shield className="h-5 w-5 text-orange-700" />

                </div>

                <div>

                  <h3 className="font-semibold">

                    {schedule.first_name} {schedule.last_name}

                  </h3>

                  <p className="text-sm text-slate-500">

                    Security Personnel

                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-4 px-5 py-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">

                  Assigned Area

                </span>

                <div className="flex items-center gap-2 font-medium">

                  <MapPin className="h-4 w-4 text-orange-600" />

                  {schedule.assigned_area}

                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">

                  Schedule Date

                </span>

                <div className="flex items-center gap-2">

                  <CalendarDays className="h-4 w-4 text-orange-600" />

                  {formatDate(schedule.schedule_date)}

                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">

                  Status

                </span>

                <Badge variant="secondary">

                  {schedule.status}

                </Badge>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <DialogFooter className="border-t bg-slate-50 px-6 py-4">

          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />

            {loading ? "Deleting..." : "Delete Schedule"}

          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}