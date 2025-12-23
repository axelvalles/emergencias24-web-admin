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
import { getErrorMessage, planSubscriptionApi } from "~/http/api-server";
import {
  PlanSubscriptionStatus,
  PayerType,
  type PlanSubscriptionListFilters,
} from "~/types/plan-subscriptions";
import { PlanSubscriptionTable } from "./plan-subscription-tables";
import { columns } from "./plan-subscription-tables/columns";

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

export default function PlanSubscriptionListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [patientId] = useQueryState("patientId", parseAsString);
  const [planId] = useQueryState("planId", parseAsString);
  const [companyId] = useQueryState("companyId", parseAsString);
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [payerType] = useQueryState("payerType", parseAsArrayOf(parseAsString));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const statusFilters = toEnumArray(
    status,
    Object.values(PlanSubscriptionStatus)
  );
  const payerTypeFilters = toEnumArray(payerType, Object.values(PayerType));

  const filters: PlanSubscriptionListFilters = {
    page,
    limit: pageLimit,
    ...(patientId ? { patientId } : {}),
    ...(planId ? { planId } : {}),
    ...(companyId ? { companyId } : {}),
    ...(statusFilters ? { status: statusFilters } : {}),
    ...(payerTypeFilters ? { payerType: payerTypeFilters } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder: sortOrder as "ASC" | "DESC" } : {}),
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["plan-subscriptions", filters],
    queryFn: () => planSubscriptionApi.getAllPlanSubscriptions(filters),
    placeholderData: (prev) => prev,
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />;
  }

  const subscriptions = data?.data ?? [];
  const totalItems = data?.total ?? 0;

  return (
    <PlanSubscriptionTable
      data={subscriptions}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
    />
  );
}
