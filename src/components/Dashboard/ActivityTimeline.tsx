import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
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
  
const activities : Activity[] = [
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
    circle: "bg-emerald-500",
    icon: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  orange: {
    circle: "bg-orange-500",
    icon: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  blue: {
    circle: "bg-blue-500",
    icon: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  red: {
    circle: "bg-red-500",
    icon: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/40",
    badge:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

export default function ActivityTimeline() {
  return (
    <Card className="border shadow-sm rounded border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>

          <div>
            <CardTitle className="text-lg font-semibold">
            Activity Logs
            </CardTitle>

            <CardDescription className="text-xs">
              Latest system activities and updates
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <ScrollArea className="h-85 pr-2">
          <div className="relative pl-9 space-y-2">

            {/* Timeline */}
            <div className="absolute left-4 top-0 h-full w-px bg-border " />

            {activities.map((activity) => {
              const Icon = activity.icon;
              const color = colorMap[activity.color];

              return (
                <div key={activity.id} className="relative">

                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-5.5 top-8 h-3 w-3 rounded-full ${color.circle} ring-4 ring-background`}
                  />

                  <div className="p-4 rounded border shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

                    <CardContent className="">
                      <div className="flex items-center justify-between gap-3">

                        {/* Left */}
                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-xl ${color.bg}`}
                          >
                            <Icon className={`h-4 w-4 ${color.icon}`} />
                          </div>

                          <div>

                            <Badge
                              className={`${color.badge} mb-1 rounded-full px-2 py-0 text-[10px] font-medium`}
                            >
                              {activity.badge}
                            </Badge>

                            <h2 className="text-xs font-semibold leading-none">
                              {activity.title}{" "}
                              <span className="font-normal text-muted-foreground">
                                {activity.description}
                              </span>
                            </h2>

                          </div>

                        </div>

                        {/* Time */}
                        <Badge
                          variant="secondary"
                          className="gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap"
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          {activity.time}
                        </Badge>

                      </div>
                    </CardContent>

                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}