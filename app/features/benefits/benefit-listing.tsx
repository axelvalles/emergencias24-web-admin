import { useQuery } from "@tanstack/react-query";
import z from "zod";
import {
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryState,
} from "nuqs";
import { toast } from "sonner";

import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import { benefitApi, getErrorMessage } from "~/http/api-server";
import { BenefitTable } from "./benefit-tables";
import { columns } from "./benefit-tables/columns";

const sortSchema = z.array(z.object({ id: z.string(), desc: z.boolean() }));

export default function BenefitListingPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setSearch(value);
  }, 400);

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["benefits", { page, pageLimit, search, sortBy, sortOrder }],
    queryFn: () =>
      benefitApi.getAllBenefits({
        page,
        limit: pageLimit,
        ...(search.trim() ? { q: search.trim() } : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),
      }),
    placeholderData: (previousData) => previousData,
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={3} rowCount={8} filterCount={1} />;
  }

  return (
    <BenefitTable
      data={data?.data ?? []}
      totalItems={data?.total ?? 0}
      columns={columns}
      isFetching={isFetching}
      globalSearch={search}
      onGlobalSearchChange={debouncedSetSearch}
    />
  );
}
