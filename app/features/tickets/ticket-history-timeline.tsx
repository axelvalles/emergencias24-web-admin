import { useQuery } from "@tanstack/react-query";
import { ticketApi } from "~/http/api-server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { TicketStatusLabels } from "~/types/tickets";
import type { TicketStatusHistory } from "~/types/tickets";

interface TicketHistoryTimelineProps {
  ticketId: string;
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
          <CardTitle>Historial del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Cargando historial...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div>No hay historial disponible</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial del Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry: TicketStatusHistory, index: number) => (
            <div key={entry.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {index < history.length - 1 && (
                  <div className="w-0.5 h-16 bg-border mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline">
                    {TicketStatusLabels[entry.status]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                {entry.changedBy && (
                  <p className="text-sm text-muted-foreground">
                    Cambiado por: {entry.changedBy.fullName}
                  </p>
                )}
                {entry.comment && (
                  <p className="text-sm mt-1">
                    {entry.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}