import { useDeferredValue, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { patientApi } from "~/http/patient-api";
import { individualPayerApi, planContractApi } from "~/http/plan-contract-api";
import { planApi } from "~/http/plan-api";
import { queryClient } from "~/lib/query-client";
import { PlanBillingPeriodLabels, PlanStatus, PlanType } from "~/types/plans";
import {
  IndividualPayerDocumentType,
  type CreateIndividualPayerDTO,
  type IndividualPayer,
  type PlanContract,
} from "~/types/plan-contracts";

const payerSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa los nombres del pagador."),
  lastName: z.string().trim().min(1, "Ingresa los apellidos del pagador."),
  documentType: z.enum(["CC", "CE", "PASSPORT", "OTHER"]),
  documentNumber: z.string().trim().min(1, "Ingresa el número de documento."),
  phone: z.string().trim(),
  email: z.string().trim().email("Ingresa un correo electrónico válido.").or(z.literal("")),
  address: z.string().trim(),
  city: z.string().trim(),
});

const documentTypeLabels: Record<IndividualPayerDocumentType, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  PASSPORT: "Pasaporte",
  OTHER: "Otro",
};

const getTodayInputDate = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(price));

export default function PlanContractForm() {
  const [payerMode, setPayerMode] = useState<"create" | "select">("create");
  const [payerSearch, setPayerSearch] = useState("");
  const deferredPayerSearch = useDeferredValue(payerSearch.trim());
  const [payerPage, setPayerPage] = useState(1);
  const [selectedPayer, setSelectedPayer] = useState<IndividualPayer | null>(null);
  const [createdPayer, setCreatedPayer] = useState<IndividualPayer | null>(null);
  const [payerDraft, setPayerDraft] = useState({
    firstName: "",
    lastName: "",
    documentType: IndividualPayerDocumentType.CC,
    documentNumber: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [planId, setPlanId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const deferredPatientSearch = useDeferredValue(patientSearch.trim());
  const [patientPage, setPatientPage] = useState(1);
  const [beneficiaryPatientIds, setBeneficiaryPatientIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(getTodayInputDate);
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [partialSuccessMessage, setPartialSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdContract, setCreatedContract] = useState<PlanContract | null>(null);

  const plansQuery = useQuery({
    queryKey: ["plans", "package-contracts"],
    queryFn: () =>
      planApi.getAllPlans({
        status: [PlanStatus.ACTIVE],
        planType: [PlanType.FAMILY, PlanType.GROUP],
        limit: 100,
      }),
  });

  const patientsQuery = useQuery({
    queryKey: ["patients", "contract-beneficiaries", deferredPatientSearch, patientPage],
    queryFn: () =>
      patientApi.getAllPatients({
        q: deferredPatientSearch || undefined,
        page: patientPage,
        limit: 20,
      }),
  });

  const payersQuery = useQuery({
    queryKey: ["individual-payers", deferredPayerSearch, payerPage],
    queryFn: () =>
      individualPayerApi.getAllIndividualPayers({
        q: deferredPayerSearch || undefined,
        page: payerPage,
        limit: 20,
      }),
    enabled: payerMode === "select",
  });

  const eligiblePlans =
    plansQuery.data?.data.filter(
      (plan) =>
        plan.status === PlanStatus.ACTIVE &&
        (plan.planType === PlanType.FAMILY || plan.planType === PlanType.GROUP) &&
        Number(plan.monthlyCost) > 0 &&
        Number.isInteger(Number(plan.beneficiaryCapacity)) &&
        Number(plan.beneficiaryCapacity) > 0
    ) ?? [];
  const selectedPlan = eligiblePlans.find((plan) => plan.id === planId);
  const capacity = Number(selectedPlan?.beneficiaryCapacity ?? 0);
  const patients = patientsQuery.data?.data ?? [];
  const payers = payersQuery.data?.data ?? [];
  const isAtCapacity = capacity > 0 && beneficiaryPatientIds.length >= capacity;

  const updatePayerDraft = (field: keyof typeof payerDraft, value: string) => {
    setPayerDraft((current) => ({ ...current, [field]: value }));
  };

  const toggleBeneficiary = (patientId: string, checked: boolean) => {
    setBeneficiaryPatientIds((current) => {
      if (checked) {
        if (current.includes(patientId) || current.length >= capacity) return current;
        return [...current, patientId];
      }
      return current.filter((id) => id !== patientId);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setPartialSuccessMessage("");

    if (!selectedPlan) {
      setFormError("Selecciona un plan familiar o grupal activo con precio y capacidad configurados.");
      return;
    }
    if (beneficiaryPatientIds.length === 0) {
      setFormError("Selecciona al menos un paciente beneficiario.");
      return;
    }
    if (beneficiaryPatientIds.length > capacity) {
      setFormError("La cantidad de beneficiarios supera la capacidad del plan.");
      return;
    }
    if (!startDate || (endDate && endDate < startDate)) {
      setFormError("Verifica las fechas del contrato.");
      return;
    }
    if (payerMode === "select" && !selectedPayer) {
      setFormError("Selecciona un pagador individual existente.");
      return;
    }

    let payer = selectedPayer;
    let payerWasCreatedForThisAttempt = false;
    setIsSubmitting(true);

    try {
      if (payerMode === "create" && !createdPayer) {
        const parsedPayer = payerSchema.safeParse(payerDraft);
        if (!parsedPayer.success) {
          setFormError(parsedPayer.error.issues[0]?.message ?? "Revisa los datos del pagador.");
          return;
        }

        const payerPayload: CreateIndividualPayerDTO = {
          firstName: parsedPayer.data.firstName,
          lastName: parsedPayer.data.lastName,
          documentType: parsedPayer.data.documentType,
          documentNumber: parsedPayer.data.documentNumber,
          ...(parsedPayer.data.phone ? { phone: parsedPayer.data.phone } : {}),
          ...(parsedPayer.data.email ? { email: parsedPayer.data.email } : {}),
          ...(parsedPayer.data.address ? { address: parsedPayer.data.address } : {}),
          ...(parsedPayer.data.city ? { city: parsedPayer.data.city } : {}),
        };
        payer = await individualPayerApi.createIndividualPayer(payerPayload);
        payerWasCreatedForThisAttempt = true;
        setCreatedPayer(payer);
        setSelectedPayer(payer);
        setPayerMode("select");
      }

      if (!payer) {
        setFormError("Selecciona o registra un pagador individual.");
        return;
      }

      const contract = await planContractApi.createPlanContract({
        planId: selectedPlan.id,
        individualPayerId: payer.id,
        beneficiaryPatientIds,
        startDate,
        ...(endDate ? { endDate } : {}),
      });

      setCreatedContract(contract);
      setPartialSuccessMessage("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plan-contracts"] }),
        queryClient.invalidateQueries({ queryKey: ["individual-payers"] }),
      ]);
    } catch {
      setFormError(
        payerWasCreatedForThisAttempt || createdPayer
          ? "El pagador quedó registrado, pero no se pudo crear el contrato. Reintenta: se usará el pagador ya creado y no se generará otro."
          : "No se pudo guardar la información. Verifica los datos e inténtalo nuevamente."
      );
      if (payerWasCreatedForThisAttempt || createdPayer) {
        setPartialSuccessMessage(
          "Pagador registrado. Puedes reintentar la creación del contrato sin duplicar el pagador."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdContract) {
    return (
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle><h2 className="text-left text-2xl font-bold">Contrato de paquete creado correctamente</h2></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><span className="font-medium">Plan:</span> {createdContract.plan.name}</p>
          <p><span className="font-medium">Pagador:</span> {createdContract.payer.fullName}</p>
          <p>
            <span className="font-medium">Beneficiarios:</span>{" "}
            {createdContract.beneficiaries.map((patient) => patient.fullName).join(", ")}
          </p>
          <p>
            <span className="font-medium">Valor fijo:</span>{" "}
            {formatPrice(createdContract.fixedPrice)}{" "}
            {PlanBillingPeriodLabels[createdContract.billingPeriod as keyof typeof PlanBillingPeriodLabels] ??
              createdContract.billingPeriod}
          </p>
          <Button asChild>
            <Link to="/suscripciones">Volver a suscripciones</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle><h2 className="text-left text-2xl font-bold">Nuevo contrato de paquete familiar o grupal</h2></CardTitle>
        <p className="text-sm text-muted-foreground">
          Registra por separado a quien paga y a los pacientes que recibirán la cobertura.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <section aria-labelledby="contract-plan-heading" className="space-y-4 rounded-lg border p-4">
            <h2 id="contract-plan-heading" className="text-lg font-semibold">Plan de paquete</h2>
            {plansQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando planes disponibles...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contract-plan">Plan de paquete</Label>
                  <select
                    id="contract-plan"
                    value={planId}
                    onChange={(event) => {
                      setPlanId(event.target.value);
                      setBeneficiaryPatientIds([]);
                    }}
                    disabled={eligiblePlans.length === 0 || isSubmitting}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Selecciona un plan</option>
                    {eligiblePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {plan.planType === PlanType.FAMILY ? "Familiar" : "Grupal"} — {formatPrice(plan.monthlyCost ?? 0)}
                      </option>
                    ))}
                  </select>
                </div>
                {eligiblePlans.length === 0 ? (
                  <p role="status" className="text-sm text-muted-foreground">
                    No hay planes disponibles. Se requiere un plan familiar o grupal activo, con precio y capacidad de beneficiarios configurados.
                  </p>
                ) : selectedPlan ? (
                  <p className="text-sm text-muted-foreground">
                    Capacidad máxima: {capacity} pacientes beneficiarios.
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section aria-labelledby="contract-payer-heading" className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1">
              <h2 id="contract-payer-heading" className="text-lg font-semibold">Pagador individual</h2>
              <p className="text-sm text-muted-foreground">
                El pagador es la persona responsable del pago; no necesita estar registrado como paciente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={payerMode === "create" ? "default" : "outline"}
                onClick={() => setPayerMode("create")}
                disabled={isSubmitting || Boolean(createdPayer)}
              >
                Registrar nuevo pagador
              </Button>
              <Button
                type="button"
                variant={payerMode === "select" ? "default" : "outline"}
                onClick={() => setPayerMode("select")}
                disabled={isSubmitting}
              >
                Seleccionar pagador existente
              </Button>
            </div>            {payerMode === "create" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payer-first-name">Nombres del pagador</Label>
                  <Input id="payer-first-name" value={payerDraft.firstName} onChange={(event) => updatePayerDraft("firstName", event.target.value)} autoComplete="given-name" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-last-name">Apellidos del pagador</Label>
                  <Input id="payer-last-name" value={payerDraft.lastName} onChange={(event) => updatePayerDraft("lastName", event.target.value)} autoComplete="family-name" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-document-type">Tipo de documento del pagador</Label>
                  <select
                    id="payer-document-type"
                    value={payerDraft.documentType}
                    onChange={(event) => updatePayerDraft("documentType", event.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {Object.entries(documentTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-document-number">Número de documento del pagador</Label>
                  <Input id="payer-document-number" value={payerDraft.documentNumber} onChange={(event) => updatePayerDraft("documentNumber", event.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-phone">Teléfono del pagador</Label>
                  <Input id="payer-phone" type="tel" value={payerDraft.phone} onChange={(event) => updatePayerDraft("phone", event.target.value)} autoComplete="tel" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-email">Correo del pagador</Label>
                  <Input id="payer-email" type="email" value={payerDraft.email} onChange={(event) => updatePayerDraft("email", event.target.value)} autoComplete="email" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-address">Dirección del pagador</Label>
                  <Input id="payer-address" value={payerDraft.address} onChange={(event) => updatePayerDraft("address", event.target.value)} autoComplete="street-address" disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer-city">Ciudad del pagador</Label>
                  <Input id="payer-city" value={payerDraft.city} onChange={(event) => updatePayerDraft("city", event.target.value)} autoComplete="address-level2" disabled={isSubmitting} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPayer ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted p-3">
                    <p role="status" className="text-sm">
                      Pagador seleccionado: <span className="font-medium">{selectedPayer.fullName}</span> — {selectedPayer.documentNumber}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedPayer(null);
                        if (createdPayer) setCreatedPayer(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cambiar pagador
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payer-search">Buscar pagador por nombre o documento</Label>
                      <Input
                        id="payer-search"
                        value={payerSearch}
                        onChange={(event) => {
                          setPayerSearch(event.target.value);
                          setPayerPage(1);
                        }}
                        placeholder="Nombre o documento"
                      />
                    </div>
                    {payersQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Buscando pagadores...</p>
                    ) : payers.length > 0 ? (
                      <ul className="space-y-2">
                        {payers.map((payer) => (
                          <li key={payer.id}>
                            <button type="button" className="w-full rounded-md border p-3 text-left hover:bg-muted" onClick={() => setSelectedPayer(payer)}>
                              <span className="block font-medium">{payer.fullName}</span>
                              <span className="block text-sm text-muted-foreground">
                                {documentTypeLabels[payer.documentType]} · {payer.documentNumber}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No se encontraron pagadores. Puedes registrar uno nuevo.
                      </p>
                    )}
                    {(payersQuery.data?.totalPages ?? 0) > 1 && (
                      <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" disabled={payerPage <= 1} onClick={() => setPayerPage((current) => current - 1)}>Anterior</Button>
                        <span className="text-sm text-muted-foreground">Página {payerPage} de {payersQuery.data?.totalPages}</span>
                        <Button type="button" variant="outline" disabled={payerPage >= (payersQuery.data?.totalPages ?? 1)} onClick={() => setPayerPage((current) => current + 1)}>Siguiente</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          <section aria-labelledby="contract-beneficiaries-heading" className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1">
              <h2 id="contract-beneficiaries-heading" className="text-lg font-semibold">Pacientes beneficiarios</h2>
              <p className="text-sm text-muted-foreground">
                Selecciona las personas que recibirán cobertura. El pagador no se agrega automáticamente como paciente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary-search">Buscar pacientes beneficiarios</Label>
              <Input
                id="beneficiary-search"
                value={patientSearch}
                onChange={(event) => {
                  setPatientSearch(event.target.value);
                  setPatientPage(1);
                }}
                placeholder="Nombre o documento"
              />
            </div>
            {patientsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Buscando pacientes...</p>
            ) : patients.length > 0 ? (
              <ul className="space-y-2">
                {patients.map((patient) => {
                  const checked = beneficiaryPatientIds.includes(patient.id);
                  return (
                    <li key={patient.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => toggleBeneficiary(patient.id, event.target.checked)}
                          disabled={(!checked && (isAtCapacity || !selectedPlan)) || isSubmitting}
                          className="mt-1 h-4 w-4 rounded border-input"
                        />
                        <span>
                          <span className="block font-medium">{patient.fullName}</span>
                          <span className="block text-sm text-muted-foreground">
                            {patient.documentType} · {patient.documentNumber}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No se encontraron pacientes con esa búsqueda.</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Beneficiarios seleccionados: {beneficiaryPatientIds.length}{selectedPlan ? " de " + capacity : ""}
              </p>
              {(patientsQuery.data?.totalPages ?? 0) > 1 && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={patientPage <= 1} onClick={() => setPatientPage((current) => current - 1)}>Anterior</Button>
                  <span className="text-sm text-muted-foreground">Página {patientPage} de {patientsQuery.data?.totalPages}</span>
                  <Button type="button" variant="outline" disabled={patientPage >= (patientsQuery.data?.totalPages ?? 1)} onClick={() => setPatientPage((current) => current + 1)}>Siguiente</Button>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="contract-dates-heading" className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
            <h2 id="contract-dates-heading" className="sr-only">Fechas del contrato</h2>
            <div className="space-y-2">
              <Label htmlFor="contract-start-date">Fecha de inicio</Label>
              <Input id="contract-start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-end-date">Fecha de fin (opcional)</Label>
              <Input id="contract-end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} min={startDate} disabled={isSubmitting} />
            </div>
          </section>

          {partialSuccessMessage && (
            <p role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {partialSuccessMessage}
            </p>
          )}
          {formError && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" asChild>
              <Link to="/suscripciones">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                plansQuery.isLoading ||
                patientsQuery.isLoading ||
                !selectedPlan ||
                beneficiaryPatientIds.length === 0 ||
                (payerMode === "select" && !selectedPayer)
              }
            >
              {isSubmitting ? "Guardando..." : createdPayer ? "Reintentar creación del contrato" : "Crear contrato"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}