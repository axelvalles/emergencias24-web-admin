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
import { benefitApi, getErrorMessage } from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import type { Benefit } from "~/types/benefits";
import { benefitFormSchema, type BenefitFormSchema } from "./schemas";

const getDefaultValues = (initialData: Benefit | null): BenefitFormSchema => ({
  name: initialData?.name ?? "",
});

interface BenefitFormProps {
  initialData: Benefit | null;
  pageTitle: string;
}

export default function BenefitForm({
  initialData,
  pageTitle,
}: BenefitFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const form = useForm<BenefitFormSchema>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const createMutation = useMutation({
    mutationFn: async (values: BenefitFormSchema) => {
      return benefitApi.createBenefit({ name: values.name.trim() });
    },
    onSuccess: async () => {
      toast.success("Beneficio creado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["benefits"] });
      navigate(`/beneficios?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: BenefitFormSchema) => {
      return benefitApi.updateBenefit(initialData!.id, {
        name: values.name.trim(),
      });
    },
    onSuccess: async (data) => {
      toast.success("Beneficio actualizado correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["benefits"] }),
        queryClient.invalidateQueries({ queryKey: ["benefit", data.id] }),
      ]);
      navigate(`/beneficios?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: BenefitFormSchema) {
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
                label="Nombre del beneficio"
                disabled={isExecuting}
                required
              />
            </div>

            <LoadingButton loading={isExecuting} disabled={isExecuting} type="submit">
              {initialData ? "Actualizar beneficio" : "Crear beneficio"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
