import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { Button } from "~/components/ui/button";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useParams } from "react-router";

interface ButtonStartProps {
  ticketId: string;
}

export default function ButtonStart({ ticketId }: ButtonStartProps) {
  const { referenceNumber } = useParams();
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => ticketApi.startTicket(ticketId),
    onSuccess: () => {
      toast.success("Ticket iniciado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["ticket-by-reference", referenceNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["ticket-history", ticketId],
      });
    },
    onError: (error) => {
      toast.error("Error al iniciar el ticket");
      console.error(error);
    },
  });

  return (
    <Button
      onClick={() => startMutation.mutate()}
      disabled={startMutation.isPending}
      variant="default"
    >
      <IconPlayerPlay className="mr-2 h-4 w-4" />
      {startMutation.isPending ? "Iniciando..." : "Iniciar"}
    </Button>
  );
}
