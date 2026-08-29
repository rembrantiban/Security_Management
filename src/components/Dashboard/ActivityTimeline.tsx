import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Clock3,
  ShieldCheck,
  User,
  Shield,
  TriangleAlert,
  History,
  type LucideIcon,
} from "lucide-react";

type ActivityColor = keyof typeof colorMap;

type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  badge: string;
  color: ActivityColor;
  icon: LucideIcon;
};

const activities: Activity[] = [
  {
    id: 1,
    title: "John Doe",
    description: "logged in",
    time: "10:35 AM",
    badge: "Login",
    color: "green",
    icon: User,
  },
  {
    id: 2,
    title: "Visitor Request",
    description: "Approved",
    time: "10:31 AM",
    badge: "Visitor",
    color: "orange",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Patrol",
    description: "Started",
    time: "10:28 AM",
    badge: "Patrol",
    color: "blue",
    icon: Shield,
  },
  {
    id: 4,
    title: "Incident",
    description: "Created",
    time: "10:20 AM",
    badge: "Incident",
    color: "red",
    icon: TriangleAlert,
  },
];

const colorMap = {
  green: {
    rail: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  orange: {
    rail: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    badge: "bg-amber-50 text-amber-800 ring-amber-100",
  },
  blue: {
    rail: "bg-blue-500",
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    badge: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  red: {
    rail: "bg-red-500",
    icon: "bg-red-50 text-red-600 ring-red-100",
    badge: "bg-red-50 text-red-700 ring-red-100",
  },
};

export default function ActivityTimeline() {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white/50 shadow-sm ring-1 text-slate-700 ring-slate-200">
      <CardHeader className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
            <History className="h-4 w-4 text-amber-800" />
          </div>

          <div>
            <p className="text-[13px] font-semibold tracking-tight text-slate-900">Activity Logs</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Latest system activities and updates
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-72">
          <div className="relative px-5 py-4">
            {/* Timeline rail */}
            <div className="absolute bottom-5 left-9.5 top-6 w-px bg-slate-200" />

            <div className="space-y-1">
              {activities.map((activity) => {
                const Icon = activity.icon;
                const color = colorMap[activity.color];

                return (
                  <div key={activity.id} className="relative flex gap-3.5">
                    {/* Node */}
                    <div className="relative z-10 shrink-0 pt-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${color.icon}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ${color.badge}`}
                            >
                              {activity.badge}
                            </span>
                            <span className={`h-1 w-1 rounded-full ${color.rail}`} />
                          </div>

                          <p className="mt-1.5 truncate text-[13px] font-medium leading-none text-slate-900">
                            {activity.title}{" "}
                            <span className="font-normal text-slate-400">
                              {activity.description}
                            </span>
                          </p>
                        </div>

                        <span className="flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}