import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    rows?: number;
}

export default function AssignAreaSkeleton({ rows = 2 }: Props) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-xl border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-3 w-40 rounded" />

                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-4 w-28 rounded" />
                                            <Skeleton className="h-4 w-16 rounded-full" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-3 w-24 rounded" />
                                            <Skeleton className="h-3 w-32 rounded" />
                                        </div>
                                    </div>
                                </div>

                                <Skeleton className="mt-3 h-3 w-full max-w-md rounded pl-11" />
                            </div>

                            <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}