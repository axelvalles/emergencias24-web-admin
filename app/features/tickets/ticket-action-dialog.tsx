import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi, userApi } from "~/http/api-server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { LoadingButton } from "~/components/ui/loading-button";
import {
  IconUser,
  IconPlayerPlay,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useParams } from "react-router";
import type { User } from "~/types/users";
import { cn } from "~/lib/utils";

export type TicketAction = "assign" | "start" | "complete" | "cancel";

interface TicketActionDialogProps {
  action: TicketAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

interface ActionConfig {
  title: string;
  description: string;
  confirmText: string;
  variant: "default" | "destructive";
  icon: React.ElementType;
  confirmClass?: string;
}

const actionConfigs: Record<TicketAction, ActionConfig> = {
  assign: {
    title: "Asignar Ticket",
    description: "Seleccione el usuario y añada un comentario opcional.",
    confirmText: "ASIGNAR",
    variant: "default",
    icon: IconUser,
  },
  start: {
    title: "Iniciar Ticket",
    description: "Confirme que va a comenzar a trabajar en este ticket.",
    confirmText: "INICIAR",
    variant: "default",
    icon: IconPlayerPlay,
  },
  complete: {
    title: "Completar Ticket",
    description: "Confirme que el ticket ha sido resuelto exitosamente.",
    confirmText: "COMPLETAR",
    variant: "default",
    icon: IconCheck,
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  cancel: {
    title: "Cancelar Ticket",
    description: "Proporcione el motivo de la cancelación.",
    confirmText: "CANCELAR",
    variant: "destructive",
    icon: IconX,
  },
};

export default function TicketActionDialog({
  action,
  open,
  onOpenChange,
  ticketId,
}: TicketActionDialogProps) {
  const { referenceNumber } = useParams();
  const queryClient = useQueryClient();
  const config = actionConfigs[action];

  const [selectedUserId, setSelectedUserId] = useState("");
  const [comment, setComment] = useState("");

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-search"],
    queryFn: () => userApi.searchUsers({ limit: 50 }),
    enabled: action === "assign",
  });

  const actionMutation = useMutation({
    mutationFn: () => {
      switch (action) {
        case "assign":
          return ticketApi.assignTicket(
            ticketId,
            selectedUserId,
            comment || undefined,
          );
        case "start":
          return ticketApi.startTicket(ticketId, comment || undefined);
        case "complete":
          return ticketApi.completeTicket(ticketId, comment || undefined);
        case "cancel":
          return ticketApi.cancelTicket(ticketId, comment || undefined);
      }
    },
    onSuccess: () => {
      toast.success(`Ticket ${action} exitosamente`);
      queryClient.invalidateQueries({
        queryKey: ["ticket-by-reference", referenceNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["ticket-history", ticketId],
      });
      resetAndClose();
    },
    onError: (error) => {
      toast.error(`Error al ${action} el ticket`);
      console.error(error);
    },
  });

  const resetAndClose = () => {
    setSelectedUserId("");
    setComment("");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (action === "assign" && !selectedUserId) {
      toast.error("Seleccione un usuario");
      return;
    }
    actionMutation.mutate();
  };

  const isLoading = actionMutation.isPending;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                action === "complete" && "bg-green-100",
                config.variant === "destructive" && "bg-red-100",
                config.variant === "default" && "bg-blue-100",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  action === "complete" && "text-green-600",
                  config.variant === "destructive" && "text-red-600",
                  config.variant === "default" && "text-blue-600",
                )}
              />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {action === "assign" && (
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user" className="w-full">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">
              {action === "cancel" ? "Motivo de cancelación" : "Comentario"}
              {action !== "cancel" && " (opcional)"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                action === "cancel"
                  ? "Describa el motivo de la cancelación..."
                  : "Añada un comentario opcional sobre esta acción..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-4">
          <Button
            variant="outline"
            className="min-w-[100px] h-10"
            onClick={resetAndClose}
            disabled={isLoading}
          >
            Cerrar
          </Button>
          <LoadingButton
            className={cn("min-w-[100px] h-10", config.confirmClass)}
            variant={config.variant}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading || (action === "assign" && !selectedUserId)}
          >
            {config.confirmText}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
