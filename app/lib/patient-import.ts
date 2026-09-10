export interface PatientImportContext {
  companyId: string;
  planId: string;
}

interface PatientImportSelection extends PatientImportContext {
  file: File | null;
}

export function getPatientImportValidationErrors(
  selection: PatientImportSelection
) {
  return {
    ...(selection.companyId
      ? {}
      : { companyId: "Debes seleccionar una empresa." }),
    ...(selection.planId ? {} : { planId: "Debes seleccionar un plan." }),
    ...(selection.file ? {} : { file: "Debes seleccionar un archivo." }),
  };
}

export function createPatientImportFormData(
  file: File,
  context: PatientImportContext
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyId", context.companyId);
  formData.append("planId", context.planId);
  return formData;
}
