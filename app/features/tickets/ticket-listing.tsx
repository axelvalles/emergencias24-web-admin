import { ticketApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { columns } from "./ticket-tables/columns";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import { TicketTable } from "./ticket-tables";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsArrayOf,
} from "nuqs";

export default function TicketListingPage() {
  // Showcasing the use of search params cache in nested RSCs
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [requesterName] = useQueryState("requesterName", parseAsString);
  const [serviceType] = useQueryState(
    "serviceType",
    parseAsArrayOf(parseAsString)
  );
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [priority] = useQueryState("priority", parseAsString);
  const [municipality] = useQueryState("municipality", parseAsString);
  const [referenceNumber] = useQueryState("referenceNumber", parseAsString);

  const filters = {
    page,
    limit: pageLimit,
    ...(requesterName && { requesterName }),
    ...(serviceType && { serviceType }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(municipality && { municipality }),
    ...(referenceNumber && { referenceNumber }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tickets",
      page,
      pageLimit,
      requesterName,
      serviceType,
      status,
      priority,
      municipality,
      referenceNumber,
    ],
    queryFn: () => ticketApi.getAllTickets(filters as any),
  });

  if (error) {
    toast.error("Error al cargar los tickets");
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />;
  }

  const tickets = data?.data || [];
  const totalItems = data?.total || 0;

  return (
    <TicketTable data={tickets} totalItems={totalItems} columns={columns} />
  );
}
