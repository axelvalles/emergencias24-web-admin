import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useTicketStore } from "~/store/useTicketStore";
import { cn } from "~/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TicketTypeLabels } from "~/types/tickets";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell() {
  const tickets = useTicketStore((state) => state.tickets);
  const newTickets = tickets.filter((t) => t.status === "pending");
  const hasNotifications = newTickets.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative p-2 rounded-full hover:bg-muted transition-colors",
            hasNotifications && "text-red-500"
          )}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {newTickets.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="text-sm font-semibold flex justify-between items-center">
          Notificaciones
          {hasNotifications && (
            <Badge variant="secondary" className="text-xs">
              {newTickets.length} nuevas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasNotifications ? (
          <ScrollArea className="h-64">
            {newTickets.map((ticket) => {
              const createdAt = new Date(ticket.createdAt);
              const relativeTime = formatDistanceToNowStrict(createdAt, {
                addSuffix: true,
                locale: es,
              });

              return (
                <DropdownMenuItem
                  key={ticket.id}
                  className="flex flex-col items-start space-y-1 cursor-pointer"
                  onClick={() => console.log("Ver ticket", ticket.id)}
                >
                  <span className="text-sm font-medium text-gray-900">
                    🚨 {TicketTypeLabels[ticket.serviceType]}
                  </span>

                  <span className="text-xs text-gray-500">
                    {ticket.requesterName}
                  </span>

                  <span className="text-[11px] text-gray-400 italic">
                    {createdAt.toLocaleString()} — {relativeTime}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        ) : (
          <DropdownMenuItem className="text-center text-gray-500 text-sm">
            No hay notificaciones nuevas
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
