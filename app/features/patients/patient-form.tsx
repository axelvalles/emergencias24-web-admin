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
  BloodTypeLabels,
  type PatientDetail,
  Gender,
  DocumentType,
} from "~/types/patients";
import type { Company } from "~/types/companies";
import { FormTextarea } from "~/components/forms/form-textarea";
import { Separator } from "~/components/ui/separator";
import { queryClient } from "~/lib/query-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";

type PatientTab =
  | "personal"
  | "medical"
  | "contact"
  | "emergency"
  | "address"
  | "company";

type TabProgressState = "pending" | "saved" | "error";

const tabOrder: PatientTab[] = [
  "personal",
  "medical",
  "contact",
  "emergency",
  "address",
  "company",
];

const tabLabels: Record<PatientTab, string> = {
  personal: "Datos personales",
  medical: "Información médica",
  contact: "Datos de contacto",
  emergency: "Contacto de emergencia",
  address: "Dirección",
  company: "Empresa",
};

const fieldsByTab: Record<PatientTab, (keyof PatientFormSchema)[]> = {
  personal: [
    "documentType",
    "documentNumber",
    "firstName",
    "lastName",
    "birthDate",
    "gender",
  ],
  medical: ["bloodType", "allergies", "medicalConditions"],
  contact: ["phone", "secondaryPhone"],
  emergency: ["emergencyContactName", "emergencyContactPhone"],
  address: ["address", "city", "state", "zipCode"],
  company: ["companyId"],
};

const tabStatusLabel: Record<TabProgressState, string> = {
  pending: "Pendiente",
  saved: "Guardado",
  error: "Con errores",
};

const tabStatusClassName: Record<TabProgressState, string> = {
  pending: "bg-amber-500",
  saved: "bg-emerald-500",
  error: "bg-red-500",
};

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  return true;
}

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

const bloodTypeOptions: FormOption[] = Object.entries(BloodTypeLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export default function PatientForm({
  initialData,
  pageTitle,
}: {
  initialData: PatientDetail | null;
  pageTitle: string;
}) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const defaultValues: PatientFormSchema = {
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : undefined,
    gender: initialData?.gender || Gender.MALE,
    bloodType: initialData?.bloodType || "",
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
    companyId: initialData?.companyId || initialData?.company?.id || "",
  };

  const navigate = useNavigate();

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyApi.getAllCompanies(),
  });

  const companyOptions: FormOption[] = companies?.data?.map((company: Company) => ({
    value: company.id,
    label: company.name,
  })) || [];

  const [activeTab, setActiveTab] = useState<PatientTab>("personal");
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(
    initialData?.id ?? null
  );
  const [tabStatus, setTabStatus] = useState<Record<PatientTab, TabProgressState>>(
    () => {
      return tabOrder.reduce(
        (acc, tab) => {
          const hasDataInTab = fieldsByTab[tab].some((field) =>
            hasMeaningfulValue(defaultValues[field])
          );
          acc[tab] = hasDataInTab ? "saved" : "pending";
          return acc;
        },
        {
          personal: "pending",
          medical: "pending",
          contact: "pending",
          emergency: "pending",
          address: "pending",
          company: "pending",
        } as Record<PatientTab, TabProgressState>
      );
    }
  );

  const createMutation = useMutation({
    mutationFn: async (data: PatientFormSchema) => {
      return await patientApi.createPatient({
        ...data,
        birthDate: data.birthDate || undefined,
        bloodType: data.bloodType || undefined,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      patientId,
      data,
    }: {
      patientId: string;
      data: Partial<PatientFormSchema>;
    }) => {
      return await patientApi.updatePatient(patientId, {
        ...data,
        birthDate: data.birthDate || undefined,
        bloodType: data.bloodType || undefined,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PatientFormSchema>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  function getNextTab(tab: PatientTab): PatientTab | null {
    const currentIndex = tabOrder.indexOf(tab);
    return tabOrder[currentIndex + 1] ?? null;
  }

  async function saveCurrentTab(tab: PatientTab) {
    const isValid = await form.trigger(fieldsByTab[tab]);
    if (!isValid) {
      setTabStatus((prev) => ({ ...prev, [tab]: "error" }));
      return false;
    }

    const values = form.getValues();
    const payload: Partial<PatientFormSchema> = {};
    fieldsByTab[tab].forEach((key) => {
      payload[key] = values[key] as never;
    });

    try {
      if (!createdPatientId) {
        if (tab !== "personal") {
          toast.error("Primero guarda los datos personales para crear el paciente");
          setActiveTab("personal");
          setTabStatus((prev) => ({ ...prev, [tab]: "pending" }));
          return false;
        }

        const created = await createMutation.mutateAsync(values);
        setCreatedPatientId(created.id);
        await queryClient.invalidateQueries({ queryKey: ["patient"] });
        setTabStatus((prev) => ({ ...prev, [tab]: "saved" }));
        toast.success("Paciente creado correctamente");
        return true;
      }

      await updateMutation.mutateAsync({
        patientId: createdPatientId,
        data: payload,
      });

      await queryClient.invalidateQueries({ queryKey: ["patient"] });
      setTabStatus((prev) => ({ ...prev, [tab]: "saved" }));
      toast.success("Sección guardada");
      return true;
    } catch {
      setTabStatus((prev) => ({ ...prev, [tab]: "error" }));
      return false;
    }
  }

  async function handleSaveAndContinue(tab: PatientTab) {
    const saved = await saveCurrentTab(tab);
    if (!saved) return;

    const nextTab = getNextTab(tab);
    if (nextTab) {
      setActiveTab(nextTab);
      return;
    }

    navigate(`/pacientes?page=${page}&perPage=${pageSize}`);
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
          <form className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                const nextTab = value as PatientTab;
                if (!createdPatientId && nextTab !== "personal") {
                  toast.error("Primero guarda los datos personales para crear el paciente");
                  return;
                }
                setActiveTab(nextTab);
              }}
              className="w-full"
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
                {tabOrder.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="h-8 px-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${tabStatusClassName[tabStatus[tab]]}`}
                      aria-hidden="true"
                    />
                    <span>{tabLabels[tab]}</span>
                    <span className="sr-only">{tabStatusLabel[tabStatus[tab]]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personal" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos personales</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("personal")}
                >
                  Guardar y continuar
                </LoadingButton>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Información médica</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormSelect
                    disabled={isExecuting}
                    control={form.control}
                    name="bloodType"
                    label="Tipo de sangre"
                    options={bloodTypeOptions}
                    placeholder="Seleccione un tipo de sangre"
                  />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
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
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("medical")}
                >
                  Guardar y continuar
                </LoadingButton>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos de contacto</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("contact")}
                >
                  Guardar y continuar
                </LoadingButton>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Contacto de emergencia</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("emergency")}
                >
                  Guardar y continuar
                </LoadingButton>
              </TabsContent>

              <TabsContent value="address" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Dirección</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  </div>
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("address")}
                >
                  Guardar y continuar
                </LoadingButton>
              </TabsContent>

              <TabsContent value="company" className="space-y-6 pt-2">
                <section className="space-y-4">
                  <h3 className="text-lg font-semibold">Empresa</h3>
                  <Separator />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormSelect
                    disabled={isExecuting}
                    control={form.control}
                    name="companyId"
                    label="Empresa"
                    options={companyOptions}
                    placeholder="Seleccione una empresa (opcional)"
                  />
                  </div>
                </section>
                <LoadingButton
                  loading={isExecuting}
                  disabled={isExecuting}
                  type="button"
                  onClick={() => handleSaveAndContinue("company")}
                >
                  Finalizar y volver al listado
                </LoadingButton>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
