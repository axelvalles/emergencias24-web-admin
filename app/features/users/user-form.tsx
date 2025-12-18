import { FormInput } from "~/components/forms/form-input";
import { FormSelect, type FormOption } from "~/components/forms/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "~/components/ui/loading-button";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMutation } from "@tanstack/react-query";
import { userApi, getErrorMessage } from "~/http/api-server";
import { userFormSchema, type UserFormSchema } from "./schemas";
import {
  type CreateUserDTO,
  type UpdateUserDTO,
  type User,
  UserRole,
  UserRoleLabels,
} from "~/types/users";
import { queryClient } from "~/lib/query-client";

const roleOptions: FormOption[] = Object.entries(UserRoleLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const buildCommonPayload = (
  values: UserFormSchema
): Omit<CreateUserDTO, "password"> => {
  const payload: Omit<CreateUserDTO, "password"> = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    role: values.role,
  };

  return values.phone && values.phone.trim().length > 0
    ? { ...payload, phone: values.phone.trim() }
    : payload;
};

const buildCreatePayload = (values: UserFormSchema): CreateUserDTO => ({
  ...buildCommonPayload(values),
  password: values.password!.trim(),
});

const buildUpdatePayload = (values: UserFormSchema): UpdateUserDTO => {
  const payload: UpdateUserDTO = { ...buildCommonPayload(values) };

  if (values.password && values.password.trim().length > 0) {
    payload.password = values.password.trim();
  }

  return payload;
};

export default function UserForm({
  initialData,
  pageTitle,
}: {
  initialData: User | null;
  pageTitle: string;
}) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: async (values: UserFormSchema) => {
      return await userApi.createUser(buildCreatePayload(values));
    },
    onSuccess: async () => {
      toast.success("Usuario creado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate(`/usuarios?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: UserFormSchema) => {
      return await userApi.updateUser(initialData!.id, buildUpdatePayload(values));
    },
    onSuccess: async (data) => {
      toast.success("Usuario actualizado correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["user", data.id] }),
      ]);
      navigate(`/usuarios?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || UserRole.CLINIC_ADMIN,
    },
  });

  async function onSubmit(values: UserFormSchema) {
    if (initialData) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="firstName"
                label="Nombre"
                required
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="lastName"
                label="Apellido"
                required
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="phone"
                label="Teléfono"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="email"
                label="Correo electrónico"
                required
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="password"
                label={initialData ? "Contraseña (opcional)" : "Contraseña"}
                type="password"
                required={!initialData}
                placeholder={initialData ? "Dejar en blanco para mantener actual" : "******"}
              />
              <FormSelect
                disabled={isExecuting}
                control={form.control}
                name="role"
                label="Rol"
                options={roleOptions}
                required
              />
            </div>

            <LoadingButton
              loading={isExecuting}
              disabled={isExecuting}
              type="submit"
            >
              {initialData ? "Actualizar usuario" : "Crear usuario"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
