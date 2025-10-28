import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { getErrorMessage } from "~/http/api-server";
import { IconX } from "@tabler/icons-react";
import { AlertModal } from "~/components/modal/alert-modal";
import { LoadingButton } from "~/components/ui/loading-button";

interface ButtonCancelProps {
  ticketId: string;
  disabled?: boolean;
}

export default function ButtonCancel({
  ticketId,
  disabled = false,
}: ButtonCancelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      return await ticketApi.cancelTicket(ticketId);
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(getErrorMessage(res.error));
        return;
      }

      setOpen(false);
      toast.success("Ticket cancelado exitosamente");
      // Refresh the data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onCancel = async () => {
    await cancelMutation.mutate();
  };

  return (
    <>
      <LoadingButton
        onClick={() => setOpen(true)}
        variant="destructive"
        disabled={disabled || loading}
        loading={loading}
      >
        <IconX className="mr-2 h-4 w-4" />
        Cancelar Ticket
      </LoadingButton>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onCancel}
        loading={loading}
      />
    </>
  );
}
