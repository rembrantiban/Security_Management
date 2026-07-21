import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Eye,
  CalendarDays,
  Truck,
  Briefcase,
  Building2,
  Clock3,
  Users,
  ArrowRight,
} from "lucide-react";

const requests = [
  {
    id: 1,
    name: "John Doe",
    initials: "JD",
    purpose: "Meeting",
    status: "Waiting",
    waiting: "5 min",
    icon: CalendarDays,
  },
  {
    id: 2,
    name: "Jane Smith",
    initials: "JS",
    purpose: "Delivery",
    status: "Pending",
    waiting: "2 min",
    icon: Truck,
  },
  {
    id: 3,
    name: "Michael Cruz",
    initials: "MC",
    purpose: "Interview",
    status: "Waiting",
    waiting: "12 min",
    icon: Briefcase,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    initials: "SW",
    purpose: "Contractor",
    status: "Urgent",
    waiting: "18 min",
    icon: Building2,
  },
];

const statusStyles = {
  Waiting:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",

  Pending:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",

  Urgent:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
};

export default function PendingRequestsTable() {
  return (
    <Card className="border shadow-sm rounded">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>

          <div>
            <CardTitle className="text-lg font-semibold">
              Pending Requests
            </CardTitle>

            <CardDescription className="text-xs">
              Review visitor requests awaiting approval.
            </CardDescription>
          </div>
        </div>

        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-90">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {requests.map((request) => {
                const Icon = request.icon;

                return (
                  <TableRow
                    key={request.id}
                    className="hover:bg-muted/40 transition-all"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-orange-500 text-white font-semibold">
                            {request.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium text-sm">
                            {request.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Visitor
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-muted p-2">
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="text-sm">
                          {request.purpose}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[request.status]}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="gap-1"
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {request.waiting}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gap-2 rounded-lg bg-amber-600"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}