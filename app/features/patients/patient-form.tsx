import { FormDatePicker } from "~/components/forms/form-date-picker";
import { FormInput } from "~/components/forms/form-input";
import { FormSelect } from "~/components/forms/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "~/components/ui/loading-button";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMutation } from "@tanstack/react-query";
import { patientApi, getErrorMessage } from "~/http/api-server";
import { createPatientSchema, type CreatePatientFormSchema } from "./schemas";
import type { PatientDetail } from "~/http/patient-api";

const genderOptions = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

const documentTypeOptions = [
  { value: "cc", label: "Cédula de ciudadanía" },
  { value: "ce", label: "Cédula de extranjería" },
  { value: "passport", label: "Pasaporte" },
];

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

  const createMutation = useMutation({
    mutationFn: async (data: CreatePatientFormSchema) => {
      return await patientApi.createPatient(data);
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(getErrorMessage(data.error));
        return;
      }

      toast.success("Paciente creado correctamente");
      navigate(`/patients?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CreatePatientFormSchema) => {
      return await patientApi.updatePatient(initialData!.id.toString(), data);
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(getErrorMessage(data.error));
        return;
      }

      toast.success("Paciente actualizado correctamente");
      navigate(`/patients?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreatePatientFormSchema>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      birth_date: initialData?.birth_date
        ? new Date(initialData.birth_date)
        : undefined,
      gender: initialData?.gender || "",
      document_type: initialData?.document_type || "",
      document_number: initialData?.document_number || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zip_code: initialData?.zip_code || "",
      phone: initialData?.phone || "",
      secondary_phone: initialData?.secondary_phone || "",
      emergency_contact_name: initialData?.emergency_contact_name || "",
      emergency_contact_phone: initialData?.emergency_contact_phone || "",
    },
  });

  async function onSubmit(values: CreatePatientFormSchema) {
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
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="first_name"
                label="Nombre"
                required
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="last_name"
                label="Apellido"
                required
              />
              <FormDatePicker
                disabled={isExecuting}
                control={form.control}
                name="birth_date"
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
                name="document_type"
                label="Tipo de documento"
                options={documentTypeOptions}
                required
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="document_number"
                label="Número de documento"
                required
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
                name="zip_code"
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
                name="secondary_phone"
                label="Teléfono secundario"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="emergency_contact_name"
                label="Nombre del contacto de emergencia"
              />
              <FormInput
                disabled={isExecuting}
                control={form.control}
                name="emergency_contact_phone"
                label="Teléfono del contacto de emergencia"
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
