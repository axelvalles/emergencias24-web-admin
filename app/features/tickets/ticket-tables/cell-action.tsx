import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useNavigate } from "react-router";
import { type FC } from "react";
import type { Ticket } from "~/types/tickets";
import { IconEdit } from "@tabler/icons-react";
import { useTicketStore } from "~/store/useTicketStore";

interface CellActionProps {
  data: Ticket;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const { removeTicket } = useTicketStore();

  const onEdit = () => {
    removeTicket(data.id);
    navigate(`/tickets/${data.referenceNumber}`);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <IconEdit className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar empresa</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
