import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { Button } from "~/components/ui/button";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { IconCheck } from "@tabler/icons-react";
import { useParams } from "react-router";

interface ButtonCompleteProps {
  ticketId: string;
}

export default function ButtonComplete({ ticketId }: ButtonCompleteProps) {
  const { referenceNumber } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: () => ticketApi.completeTicket(ticketId),
    onSuccess: () => {
      toast.success("Ticket completado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["ticket-by-reference", referenceNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["ticket-history", ticketId],
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error("Error al completar el ticket");
      console.error(error);
    },
  });

  const handleComplete = () => {
    completeMutation.mutate();
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} variant="success" size="sm">
        <IconCheck className="mr-2 h-4 w-4" />
        Completar
      </Button>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleComplete}
        loading={completeMutation.isPending}
        confirmText="COMPLETAR TICKET"
      />
    </>
  );
}
