import { ticketApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { columns } from "./ticket-tables/columns";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import { TicketTable } from "./ticket-tables";
import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsArrayOf,
  parseAsJson,
} from "nuqs";
import z from "zod";
import type { TicketPriority } from "~/types/tickets";
import {
  type QueryTicketsParams,
  TicketStatus,
  TicketType,
} from "~/types/tickets";

const sortSchema = z.array(z.object({ id: z.string(), desc: z.boolean() }));

const toEnumArray = <T extends string>(
  values: string[] | null,
  allowed: readonly T[]
) => {
  if (!values || values.length === 0) {
    return undefined;
  }

  const filtered = values.filter((value): value is T =>
    allowed.includes(value as T)
  );

  return filtered.length > 0 ? filtered : undefined;
};

export default function TicketListingPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [serviceType] = useQueryState(
    "serviceType",
    parseAsArrayOf(parseAsString)
  );
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [priority] = useQueryState("priority", parseAsString);
  const [municipality] = useQueryState("municipality", parseAsString);
  const [referenceNumber] = useQueryState("referenceNumber", parseAsString);
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setSearch(value);
  }, 400);

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const filters: QueryTicketsParams = {
    page,
    limit: pageLimit,
    q: search.trim() || undefined,
    serviceType: toEnumArray(serviceType, Object.values(TicketType)),
    status: toEnumArray(status, Object.values(TicketStatus)),
    priority: (priority as TicketPriority) || undefined,
    municipality: municipality || undefined,
    referenceNumber: referenceNumber ? Number(referenceNumber) : undefined,
    sortBy,
    sortOrder: sortOrder as "ASC" | "DESC",
  };

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => ticketApi.getAllTickets(filters),
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
    <TicketTable
      data={tickets}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
      globalSearch={search}
      onGlobalSearchChange={debouncedSetSearch}
    />
  );
}
