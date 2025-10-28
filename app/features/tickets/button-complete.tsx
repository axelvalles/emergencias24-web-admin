import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi } from "~/http/api-server";
import { getErrorMessage } from "~/http/api-server";
import { Button } from "~/components/ui/button";
import { IconCheck } from "@tabler/icons-react";
import { AlertModal } from "~/components/modal/alert-modal";
import { LoadingButton } from "~/components/ui/loading-button";

interface ButtonCompleteProps {
  ticketId: string;
  disabled?: boolean;
}

export default function ButtonComplete({
  ticketId,
  disabled = false,
}: ButtonCompleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const completeMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      return await ticketApi.completeTicket(ticketId);
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(getErrorMessage(res.error));
        return;
      }

      setOpen(false);
      toast.success("Ticket completado exitosamente");
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

  const onComplete = async () => {
    await completeMutation.mutate();
  };

  return (
    <>
      <LoadingButton
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700"
        disabled={disabled || loading}
        loading={loading}
      >
        <IconCheck className="mr-2 h-4 w-4" />
        Completar Ticket
      </LoadingButton>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onComplete}
        loading={loading}
      />
    </>
  );
}
