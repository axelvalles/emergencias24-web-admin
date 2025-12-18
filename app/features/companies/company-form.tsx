import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { FormInput } from "~/components/forms/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";

import { getErrorMessage } from "~/http/api-server";
import { companyApi } from "~/http/company-api";
import { queryClient } from "~/lib/query-client";
import { type Company } from "~/types/companies";
import { companyFormSchema, type CompanyFormSchema } from "./schemas";

const getDefaultValues = (initialData: Company | null): CompanyFormSchema => ({
  name: initialData?.name ?? "",
  taxId: initialData?.taxId ?? "",
  contactEmail: initialData?.contactEmail ?? "",
  contactPhone: initialData?.contactPhone ?? "",
});

interface CompanyFormProps {
  initialData: Company | null;
  pageTitle: string;
}

export default function CompanyForm({
  initialData,
  pageTitle,
}: CompanyFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const form = useForm<CompanyFormSchema>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const createMutation = useMutation({
    mutationFn: async (values: CompanyFormSchema) => {
      return companyApi.createCompany(values);
    },
    onSuccess: async () => {
      toast.success("Empresa creada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      navigate(`/empresas?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CompanyFormSchema) => {
      return companyApi.updateCompany(initialData!.id, values);
    },
    onSuccess: async (data) => {
      toast.success("Empresa actualizada correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["company", data.id] }),
      ]);
      navigate(`/empresas?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: CompanyFormSchema) {
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                control={form.control}
                name="name"
                label="Nombre de la empresa"
                disabled={isExecuting}
                required
              />
              <FormInput
                control={form.control}
                name="taxId"
                label="NIT / Tax ID"
                disabled={isExecuting || initialData !== null}
                required
              />
              <FormInput
                control={form.control}
                name="contactEmail"
                label="Email de contacto"
                type="email"
                disabled={isExecuting}
                required
              />
              <FormInput
                control={form.control}
                name="contactPhone"
                label="Teléfono de contacto"
                disabled={isExecuting}
                required
              />
            </div>

            <LoadingButton
              loading={isExecuting}
              disabled={isExecuting}
              type="submit"
            >
              {initialData ? "Actualizar empresa" : "Crear empresa"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
