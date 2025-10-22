import { useParams } from "react-router";
import TicketViewPage from "~/features/tickets/ticket-view-page";

export default function TicketDetail() {
  const { id } = useParams();

  // Check if id is a number (reference number) or UUID
  const isReferenceNumber = /^\d+$/.test(id || "");

  return <TicketViewPage isReferenceNumber={isReferenceNumber} />;
}