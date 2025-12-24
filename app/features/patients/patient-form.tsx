import { FormDatePicker } from "~/components/forms/form-date-picker";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { patientApi, companyApi, getErrorMessage } from "~/http/api-server";
import { patientFormSchema, type PatientFormSchema } from "./schemas";
import {
  DocumentTypeLabels,
  GenderLabels,
  type PatientDetail,
  Gender,
  DocumentType,
} from "~/types/patients";
import type { Company } from "~/types/companies";
import { FormTextarea } from "~/components/forms/form-textarea";
import { queryClient } from "~/lib/query-client";

const genderOptions: FormOption[] = Object.entries(GenderLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const documentTypeOptions: FormOption[] = Object.entries(
  DocumentTypeLabels
).map(([value, label]) => ({
  value,
  label,
}));

export default function PatientForm({
  initialData,
  pageTitle,
}: {
  initialData: PatientDetail | null;
  pageTitle: string;
}) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyApi.getAllCompanies(),
  });

  const companyOptions: FormOption[] = companies?.data?.map((company: Company) => ({
    value: company.id,
    label: company.name,
  })) || [];

  const createMutation = useMutation({
    mutationFn: async (data: PatientFormSchema) => {
      return await patientApi.createPatient({
        ...data,
        birthDate: data.birthDate || undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Paciente creado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["patient"] });
      navigate(`/pacientes?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PatientFormSchema) => {
      return await patientApi.updatePatient(initialData!.id.toString(), {
        ...data,
        birthDate: data.birthDate || undefined,
      });
    },
    onSuccess: async (data) => {
      toast.success("Paciente actualizado correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["patient", data.id],
      });
      navigate(`/pacientes?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PatientFormSchema>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      birthDate: initialData?.birthDate
        ? new Date(initialData.birthDate)
        : undefined,
      gender: initialData?.gender || Gender.MALE,
      documentType: initialData?.documentType || DocumentType.CC,
      documentNumber: initialData?.documentNumber || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      phone: initialData?.phone || "",
      secondaryPhone: initialData?.secondaryPhone || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      allergies: initialData?.allergies || "",
      medicalConditions: initialData?.medicalConditions || "",
      companyId: initialData?.companyId || "",
    },
  });

  async function onSubmit(values: PatientFormSchema) {
    if (initialData) {
      await updateMutation.mutate(values);
    } else {
      await createMutation.mutate(values);
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
              <FormSelect
                disabled={isExecuting || !!initialData}
                control={form.control}
                name="documentType"
                label="Tipo de documento"
                options={documentTypeOptions}
                required
              />
              <FormInput
                disabled={isExecuting || !!initialData}
                control={form.control}
                name="documentNumber"
                label="Número de documento"
                required
              />
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
              <FormDatePicker
                disabled={isExecuting}
                control={form.control}
                name="birthDate"
                label="Fecha de nacimiento"
              />
              <FormSelect
                disabled={isExecuting}
                control={form.control}
                name="gender"
                label="Género"
                options={genderOptions}
                required
              />
              <FormSelect
                disabled={isExecuting}
                control={form.control}
                name="companyId"
                label="Empresa"
                options={companyOptions}
                placeholder="Seleccione una empresa (opcional)"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="address"
                label="Dirección"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="city"
                label="Ciudad"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="state"
                label="Departamento / Estado"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="zipCode"
                label="Código postal"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="phone"
                label="Teléfono principal"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="secondaryPhone"
                label="Teléfono secundario"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="emergencyContactName"
                label="Nombre del contacto de emergencia"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="emergencyContactPhone"
                label="Teléfono del contacto de emergencia"
              />

              <FormTextarea
                disabled={isExecuting}
                control={form.control}
                name="allergies"
                label="Alergias"
              />

              <FormTextarea
                disabled={isExecuting}
                control={form.control}
                name="medicalConditions"
                label="Condiciones médicas"
              />
            </div>

            <LoadingButton
              loading={isExecuting}
              disabled={isExecuting}
              type="submit"
            >
              {initialData ? "Actualizar paciente" : "Agregar paciente"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
