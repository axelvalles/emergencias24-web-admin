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
import { getErrorMessage, planApi } from "~/http/api-server";
import { PlanStatus, PlanType } from "~/types/plans";
import type { PlanListFilters } from "~/types/plans";
import { PlanTable } from "./plan-tables";
import { columns } from "./plan-tables/columns";

const sortSchema = z.array(z.object({ id: z.string(), desc: z.boolean() }));

const toEnumArray = <T extends string>(
  values: string[] | null,
  allowed: readonly T[],
) => {
  if (!values || values.length === 0) {
    return undefined;
  }

  const filtered = values.filter((value): value is T =>
    allowed.includes(value as T),
  );

  return filtered.length > 0 ? filtered : undefined;
};

const parsePriceRange = (value: string | null) => {
  if (!value) {
    return {} as { monthlyCostMin?: number; monthlyCostMax?: number };
  }

  const [minRaw, maxRaw] = value.split(",");
  const min = Number(minRaw);
  const max = Number(maxRaw);

  return {
    ...(Number.isFinite(min) ? { monthlyCostMin: min } : {}),
    ...(Number.isFinite(max) ? { monthlyCostMax: max } : {}),
  } as { monthlyCostMin?: number; monthlyCostMax?: number };
};

export default function PlanListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [name] = useQueryState("name", parseAsString);
  const [planType] = useQueryState(
    "planType",
    parseAsArrayOf(parseAsString),
  );
  const [status] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString),
  );
  const [monthlyCost] = useQueryState("monthlyCost", parseAsString);
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const statusFilters = toEnumArray(status, Object.values(PlanStatus));
  const planTypeFilters = toEnumArray(planType, Object.values(PlanType));
  const priceFilters = parsePriceRange(monthlyCost);

  const filters: PlanListFilters = {
    page,
    limit: pageLimit,
    ...(name ? { name } : {}),
    ...(statusFilters ? { status: statusFilters } : {}),
    ...(planTypeFilters ? { planType: planTypeFilters } : {}),
    ...priceFilters,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder: sortOrder as "ASC" | "DESC" } : {}),
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["plans", filters],
    queryFn: () => planApi.getAllPlans(filters),
    placeholderData: (prev) => prev,
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={8} filterCount={5} />;
  }

  const plans = data?.data ?? [];
  const totalItems = data?.total ?? 0;

  return (
    <PlanTable
      data={plans}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
    />
  );
}
