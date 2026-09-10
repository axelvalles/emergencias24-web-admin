import { useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { companyApi, patientApi, planApi } from "~/http/api-server";
import { CompanyStatus } from "~/types/companies";
import { PlanStatus, PlanTypeLabels } from "~/types/plans";
import { getPatientImportValidationErrors } from "~/lib/patient-import";

interface PatientImportDialogProps {
  onImported: () => void | Promise<void>;
}

const ALLOWED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function PatientImportDialog({
  onImported,
}: PatientImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [planId, setPlanId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["patient-import-companies", CompanyStatus.ACTIVE],
    queryFn: () =>
      companyApi.getAllCompanies({
        limit: 100,
        status: [CompanyStatus.ACTIVE],
        sortBy: "name",
        sortOrder: "ASC",
      }),
    enabled: open,
  });
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["patient-import-plans", PlanStatus.ACTIVE],
    queryFn: () =>
      planApi.getAllPlans({
        limit: 100,
        status: [PlanStatus.ACTIVE],
        sortBy: "name",
        sortOrder: "ASC",
      }),
    enabled: open,
  });
  const validationErrors = getPatientImportValidationErrors({
    companyId,
    planId,
    file,
  });

  const reset = () => {
    setCompanyId("");
    setPlanId("");
    setFile(null);
    setSubmitted(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !isUploading) reset();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast.error("Solo se permiten archivos .xlsx o .csv");
      event.target.value = "";
      setFile(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("El archivo no puede superar los 50 MB");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (Object.keys(validationErrors).length > 0 || !file) return;

    setIsUploading(true);
    try {
      await patientApi.uploadPatients(file, { companyId, planId });
      toast.success("Pacientes importados exitosamente");
      await onImported();
      setOpen(false);
      reset();
    } catch {
      toast.error("Error al importar pacientes");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconUpload className="h-4 w-4" />
          Cargar plantilla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar pacientes</DialogTitle>
          <DialogDescription>
            Selecciona la empresa y el plan que se asignarán a todos los
            pacientes del archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="import-company">
              Empresa <span className="text-red-500">*</span>
            </label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger id="import-company" className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingCompanies
                      ? "Cargando empresas..."
                      : "Selecciona una empresa activa"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {companies?.data.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && validationErrors.companyId && (
              <p className="text-sm text-destructive">
                {validationErrors.companyId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="import-plan">
              Plan <span className="text-red-500">*</span>
            </label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger id="import-plan" className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingPlans
                      ? "Cargando planes..."
                      : "Selecciona un plan activo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {plans?.data.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {PlanTypeLabels[plan.planType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitted && validationErrors.planId && (
              <p className="text-sm text-destructive">
                {validationErrors.planId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="patient-import-file">
              Archivo <span className="text-red-500">*</span>
            </label>
            <input
              id="patient-import-file"
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {submitted && validationErrors.file && (
              <p className="text-sm text-destructive">
                {validationErrors.file}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Importando..." : "Importar pacientes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
