import { useQuery } from "@tanstack/react-query";
import z from "zod";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryState,
} from "nuqs";
import { toast } from "sonner";

import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import { getErrorMessage } from "~/http/api-server";
import { companyApi } from "~/http/company-api";
import { useDebouncedCallback } from "~/hooks/use-debounced-callback";
import { type CompanyListFilters, CompanyStatus } from "~/types/companies";
import { CompanyTable } from "./company-tables";
import { columns } from "./company-tables/columns";

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

export default function CompanyListingPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const statusFilters = toEnumArray(status, Object.values(CompanyStatus));

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setSearch(value);
  }, 400);

  const filters: CompanyListFilters = {
    page,
    limit: pageLimit,
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(statusFilters ? { status: statusFilters } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder: sortOrder as "ASC" | "DESC" } : {}),
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["companies", filters],
    queryFn: () => companyApi.getAllCompanies(filters),
    placeholderData: (prev) => prev,
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={4} rowCount={8} filterCount={2} />;
  }

  const companies = data?.data ?? [];
  const totalItems = data?.total ?? 0;

  return (
    <CompanyTable
      data={companies}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
      globalSearch={search}
      onGlobalSearchChange={debouncedSetSearch}
    />
  );
}
