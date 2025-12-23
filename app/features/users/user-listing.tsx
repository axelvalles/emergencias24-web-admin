import { getErrorMessage, userApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableSkeleton } from "~/components/ui/table/data-table-skeleton";
import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsJson,
  parseAsArrayOf,
} from "nuqs";
import z from "zod";
import { columns } from "./user-tables/columns";
import { UserTable } from "./user-tables";
import type { UserListFilters } from "~/http/user-api";
import { UserRole, UserStatus } from "~/types/users";

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

export default function UserListingPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [fullName] = useQueryState("fullName", parseAsString);
  const [email] = useQueryState("email", parseAsString);
  const [phone] = useQueryState("phone", parseAsString);
  const [role] = useQueryState("role", parseAsArrayOf(parseAsString));
  const [status] = useQueryState("status", parseAsArrayOf(parseAsString));
  const [sort] = useQueryState("sort", parseAsJson(sortSchema));

  const sortBy = sort && sort.length > 0 ? sort[0].id : undefined;
  const sortOrder: UserListFilters["sortOrder"] =
    sort && sort.length > 0 ? (sort[0].desc ? "DESC" : "ASC") : undefined;

  const filters: UserListFilters = {
    page,
    limit: pageLimit,
    fullName: fullName || undefined,
    email: email || undefined,
    phone: phone || undefined,
    role: toEnumArray(role, Object.values(UserRole)),
    status: toEnumArray(status, Object.values(UserStatus)),
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.getAllUsers(filters),
    placeholderData: (previousData) => previousData,
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  const users = data?.data || [];
  const totalItems = data?.total || 0;

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={4} />;
  }

  return (
    <UserTable
      data={users}
      totalItems={totalItems}
      columns={columns}
      isFetching={isFetching}
    />
  );
}
