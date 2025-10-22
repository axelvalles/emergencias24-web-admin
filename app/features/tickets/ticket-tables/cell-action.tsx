import { AlertModal } from "~/components/modal/alert-modal";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { IconEye, IconDotsVertical, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, type FC } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ticketApi, getErrorMessage } from "~/http/api-server";
import type { Ticket } from "~/types/tickets";
import { TicketStatus } from "~/types/tickets";

interface CellActionProps {
  data: Ticket;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const resolveMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      return await ticketApi.updateTicketStatus(data.id, TicketStatus.COMPLETED);
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(getErrorMessage(res.error));
        return;
      }

      setOpen(false);
      toast.success("Ticket resuelto exitosamente");
      // TODO: Refresh the page or update the list
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onResolve = async () => {
    await resolveMutation.mutate();
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onResolve}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigate(`/tickets/${data.referenceNumber || data.id}`)}
          >
            <IconEye className="mr-2 h-4 w-4" /> Ver Detalles
          </DropdownMenuItem>
          {data.status !== TicketStatus.COMPLETED && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <IconCheck className="mr-2 h-4 w-4" /> Resolver Ticket
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};