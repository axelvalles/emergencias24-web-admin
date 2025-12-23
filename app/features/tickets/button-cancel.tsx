import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { Button } from "~/components/ui/button";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import { IconX } from "@tabler/icons-react";
import { useParams } from "react-router";

interface ButtonCancelProps {
  ticketId: string;
}

export default function ButtonCancel({ ticketId }: ButtonCancelProps) {
  const { referenceNumber } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => ticketApi.cancelTicket(ticketId, reason),
    onSuccess: () => {
      toast.success("Ticket cancelado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["ticket-by-reference", referenceNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["ticket-history", ticketId],
      });
      setIsModalOpen(false);
      setReason("");
    },
    onError: (error) => {
      toast.error("Error al cancelar el ticket");
      console.error(error);
    },
  });

  const handleCancel = () => {
    if (reason.trim()) {
      cancelMutation.mutate(reason);
    } else {
      toast.error("Debe proporcionar un motivo de cancelación");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="destructive"
        size="sm"
      >
        <IconX className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Modal
        title="Cancelar Ticket"
        description="Proporcione el motivo de la cancelación del ticket."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col space-y-4 pt-2">
          <Textarea
            placeholder="Motivo de cancelación..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={cancelMutation.isPending}
            rows={4}
          />
          <div className="flex w-full items-center justify-end space-x-2 pt-4">
            <Button
              disabled={cancelMutation.isPending}
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!reason.trim() || cancelMutation.isPending}
              variant="destructive"
              onClick={handleCancel}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
