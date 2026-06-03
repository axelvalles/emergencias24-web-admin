import { useQuery } from "@tanstack/react-query";
import { ticketApi } from "~/http/api-server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  TicketStatus,
  TicketStatusLabels,
} from "~/types/tickets";
import type { TicketStatusHistory } from "~/types/tickets";
import {
  IconCircle,
  IconUserCheck,
  IconPlayerPlay,
  IconCircleCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "~/lib/utils";

interface TicketHistoryTimelineProps {
  ticketId: string;
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case TicketStatus.PENDING:
      return IconCircle;
    case TicketStatus.ASSIGNED:
      return IconUserCheck;
    case TicketStatus.IN_PROGRESS:
      return IconPlayerPlay;
    case TicketStatus.COMPLETED:
      return IconCircleCheck;
    case TicketStatus.CANCELED:
      return IconX;
    default:
      return IconCircle;
  }
}

function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.PENDING:
      return "text-red-500 bg-red-100 border-red-200";
    case TicketStatus.ASSIGNED:
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case TicketStatus.IN_PROGRESS:
      return "text-orange-500 bg-orange-100 border-orange-200";
    case TicketStatus.COMPLETED:
      return "text-green-600 bg-green-100 border-green-200";
    case TicketStatus.CANCELED:
      return "text-gray-500 bg-gray-100 border-gray-200";
    default:
      return "text-muted-foreground bg-muted border-muted";
  }
}

function getLineColor(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.PENDING:
      return "bg-red-200";
    case TicketStatus.ASSIGNED:
      return "bg-yellow-200";
    case TicketStatus.IN_PROGRESS:
      return "bg-orange-200";
    case TicketStatus.COMPLETED:
      return "bg-green-200";
    case TicketStatus.CANCELED:
      return "bg-gray-200";
    default:
      return "bg-muted";
  }
}

export default function TicketHistoryTimeline({ ticketId }: TicketHistoryTimelineProps) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["ticket-history", ticketId],
    queryFn: () => ticketApi.getTicketHistory(ticketId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <IconClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay historial disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial del Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {history.map((entry: TicketStatusHistory, index: number) => {
            const Icon = getStatusIcon(entry.status);
            const colorClass = getStatusColor(entry.status);
            const lineColor = getLineColor(entry.status);
            const isLast = index === history.length - 1;

            return (
              <div key={entry.id} className="relative pl-8 pb-6">
                <div
                  className={cn(
                    "absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2",
                    colorClass
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[13px] top-8 w-0.5 h-full",
                      lineColor
                    )}
                  />
                )}

                <div className="ml-4 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        entry.status === TicketStatus.PENDING && "border-red-200 text-red-600 bg-red-50",
                        entry.status === TicketStatus.ASSIGNED && "border-yellow-200 text-yellow-600 bg-yellow-50",
                        entry.status === TicketStatus.IN_PROGRESS && "border-orange-200 text-orange-600 bg-orange-50",
                        entry.status === TicketStatus.COMPLETED && "border-green-200 text-green-600 bg-green-50",
                        entry.status === TicketStatus.CANCELED && "border-gray-200 text-gray-600 bg-gray-50"
                      )}
                    >
                      {TicketStatusLabels[entry.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "dd/MM/yyyy hh:mm a")}
                    </span>
                  </div>

                  {entry.changedBy && (
                    <p className="text-sm mt-1.5 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {entry.changedBy.fullName}
                      </span>
                      {" "}realizó este cambio
                    </p>
                  )}

                  {entry.comment && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md border-l-2 border-primary/50">
                      <p className="text-sm text-foreground italic">"{entry.comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}