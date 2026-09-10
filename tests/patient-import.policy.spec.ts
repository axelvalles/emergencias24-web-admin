import { expect, test } from "@playwright/test";

import {
  createPatientImportFormData,
  getPatientImportValidationErrors,
} from "~/lib/patient-import";
import { canAccessRole } from "~/lib/access-control";
import { UserRole } from "~/types/users";

test("builds a patient-only upload with authoritative catalog selections", () => {
  const file = new File(["patients"], "patients.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const formData = createPatientImportFormData(file, {
    companyId: "company-1",
    planId: "plan-1",
  });

  expect(formData.get("file")).toBe(file);
  expect(formData.get("companyId")).toBe("company-1");
  expect(formData.get("planId")).toBe("plan-1");
  expect([...formData.keys()].sort()).toEqual(["companyId", "file", "planId"]);
});

test("requires one company, one plan, and one workbook", () => {
  expect(
    getPatientImportValidationErrors({
      companyId: "",
      planId: "",
      file: null,
    }),
  ).toEqual({
    companyId: "Debes seleccionar una empresa.",
    planId: "Debes seleccionar un plan.",
    file: "Debes seleccionar un archivo.",
  });
});

test("restricts patient import controls to admin roles", () => {
  expect(canAccessRole(UserRole.ADMIN, [UserRole.ADMIN])).toBe(true);
  expect(canAccessRole(UserRole.SUPER_ADMIN, [UserRole.ADMIN])).toBe(true);
  expect(canAccessRole(UserRole.DISPATCHER, [UserRole.ADMIN])).toBe(false);
});
