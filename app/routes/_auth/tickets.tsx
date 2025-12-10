import { Separator } from "@radix-ui/react-select";
import PageContainer from "~/components/layout/page-container";
import { Heading } from "~/components/ui/heading";
import TicketListingPage from "~/features/tickets/ticket-listing";

export default function Tickets() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Tickets" description="Gestiona los tickets de emergencia." />
        </div>
        <Separator />
        <TicketListingPage />
      </div>
    </PageContainer>
  );
}