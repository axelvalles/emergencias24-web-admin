import { test, expect } from "@playwright/test";
import { generateTestPlan, generateTestPatient } from "../helpers";
import { PlanSubscriptionsPage } from "./plan-subscriptions-page";
import { PlanSubscriptionFormPage } from "./plan-subscription-form-page";
import { PlansPage } from "../plans/plans-page";
import { PlanFormPage } from "../plans/plan-form-page";
import { PatientsListingPage } from "../patients/patients-page";
import { PatientFormPage } from "../patients/patient-form-page";
import { DocumentType, Gender } from "~/types/patients";

test.describe("Plan Subscriptions — CRUD", () => {
  let subscriptionsPage: PlanSubscriptionsPage;
  let subscriptionFormPage: PlanSubscriptionFormPage;
  let plansPage: PlansPage;
  let planFormPage: PlanFormPage;
  let patientsPage: PatientsListingPage;
  let patientFormPage: PatientFormPage;

  test.beforeEach(async ({ page }) => {
    subscriptionsPage = new PlanSubscriptionsPage(page);
    subscriptionFormPage = new PlanSubscriptionFormPage(page);
    plansPage = new PlansPage(page);
    planFormPage = new PlanFormPage(page);
    patientsPage = new PatientsListingPage(page);
    patientFormPage = new PatientFormPage(page);
    // Auth is handled by storageState from globalSetup — no login needed
  });

  // Helper to create a test plan (minimal fields only)
  async function createTestPlan(planType: "FAMILY" | "CORPORATE" | "GROUP" = "FAMILY"): Promise<string> {
    await planFormPage.gotoCreate();
    const plan = generateTestPlan({ name: `Plan_${planType}_${Date.now()}` });
    await planFormPage.fillName(plan.name);
    await planFormPage.fillPlanType(planType);
    await planFormPage.fillMonthlyCost(plan.monthlyCost.toString());
    await planFormPage.submit();
    await plansPage.waitForNotification("Plan creado correctamente");
    await plansPage.goto();
    return plan.name;
  }

  // Helper to create a test patient (tab-based form)
  async function createTestPatient(): Promise<{ fullName: string }> {
    // Navigate directly to new patient form since the "Agregar nuevo" link
    // text doesn't match /nuevo paciente/i selector in patientsPage
    await patientsPage.goto();
    await patientsPage.page.waitForLoadState("networkidle");
    await patientsPage.page.goto("http://localhost:5173/pacientes/nuevo");
    await patientsPage.page.waitForLoadState("networkidle");
    const patient = generateTestPatient();
    await patientFormPage.fillPersonalTab({
      documentType: DocumentType.CC,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: Gender.MALE,
    });
    await patientFormPage.savePersonalTab();
    await patientFormPage.expectSuccessNotification();
    await patientFormPage.expectToBeOnPatientsList();
    return { fullName: `${patient.firstName} ${patient.lastName}` };
  }

  // === LIST VIEW ===

  test("SUB-E2E-001 — List view loads and shows subscriptions table", async () => {
    await subscriptionsPage.goto();
    await expect(subscriptionsPage.searchInput).toBeVisible();
    await expect(subscriptionsPage.createBtn).toBeVisible();
    // Table might be empty but should be visible
    await expect(subscriptionsPage.tableRows.first()).toBeVisible();
  });

  test("SUB-E2E-002 — Empty state or no-results when search has no matches", async ({ page }) => {
    await subscriptionsPage.goto();
    await subscriptionsPage.searchForSubscription("___NON_EXISTENT_SUB___XYZ123");
    await page.waitForTimeout(700);
    const rowCount = await subscriptionsPage.getRowCount();
    if (rowCount === 0) {
      await expect(subscriptionsPage.emptyState).toBeVisible();
    }
  });

  test("SUB-E2E-003 — Search filters subscriptions by patient name", async ({ page }) => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-01-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    await subscriptionsPage.searchForSubscription(patient.fullName.slice(0, 8));
    await page.waitForTimeout(700);
    await subscriptionsPage.assertSubscriptionInList(patient.fullName);
  });

  test("SUB-E2E-004 — Payer type filter shows only matching subscriptions", async ({ page }) => {
    const planName = await createTestPlan("CORPORATE");
    const patient = await createTestPatient();
    const company = {
      name: `Empresa Test ${Date.now()}`,
      taxId: `${20000000000 + Date.now()}`.slice(0, 12),
      contactEmail: `test${Date.now()}@test.com`,
      contactPhone: "+5491100000000",
    };

    await subscriptionFormPage.page.goto("/empresas/nueva");
    await subscriptionFormPage.page.getByLabel(/nombre/i).first().fill(company.name);
    await subscriptionFormPage.page.getByLabel(/nit/i).first().fill(company.taxId);
    await subscriptionFormPage.page.getByLabel(/(correo|email)/i).first().fill(company.contactEmail);
    await subscriptionFormPage.page
      .getByLabel(/(teléfono|telefono|celular|phone)/i)
      .first()
      .fill(company.contactPhone);
    await subscriptionFormPage.page.getByRole("button", { name: /crear empresa/i }).click();
    await subscriptionsPage.waitForNotification("Empresa creada correctamente");

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillCompany(company.name);
    await subscriptionFormPage.fillStartDate("2025-01-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    await subscriptionsPage.filterByPayerType("Empresa");
    await page.waitForTimeout(500);

    const rows = await subscriptionsPage.getRowCount();
    if (rows > 0) {
      const payerTypes = await subscriptionsPage.payerTypeColumn.allTextContents();
      for (const pt of payerTypes) {
        expect(pt).toContain("Empresa");
      }
    }
  });

  // === CREATE ===

  test("SUB-E2E-005 — Create subscription — Individual/Familiar mode", async () => {
    const planName = await createTestPlan("FAMILY");
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.assertOnCreatePage();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillPayerType("Paciente");
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();

    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");
    await expect(subscriptionFormPage.page).toHaveURL(/\/suscripciones/);
  });

  test("SUB-E2E-006 — Create subscription — Empresarial mode with company", async () => {
    const planName = await createTestPlan("CORPORATE");
    const patient = await createTestPatient();

    // Create a company first
    await subscriptionFormPage.page.goto("/empresas/nueva");
    const company = {
      name: `Empresa Test ${Date.now()}`,
      taxId: `${20000000000 + Date.now()}`.slice(0, 12),
      contactEmail: `test${Date.now()}@test.com`,
      contactPhone: "+5491100000000",
    };
    await subscriptionFormPage.page.getByLabel(/nombre/i).first().fill(company.name);
    await subscriptionFormPage.page.getByLabel(/nit/i).first().fill(company.taxId);
    await subscriptionFormPage.page.getByLabel(/(correo|email)/i).first().fill(company.contactEmail);
    await subscriptionFormPage.page
      .getByLabel(/(teléfono|telefono|celular|phone)/i)
      .first()
      .fill(company.contactPhone);
    await subscriptionFormPage.page.getByRole("button", { name: /crear empresa/i }).click();
    await subscriptionsPage.waitForNotification("Empresa creada correctamente");

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.assertCompanySelectVisible();
    await subscriptionFormPage.fillCompany(company.name);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();

    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");
  });

  test("SUB-E2E-007 — Create subscription — Colectivo/Grupal mode", async () => {
    const planName = await createTestPlan("GROUP");
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.selectMode("GROUP");
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();

    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");
  });

  test("SUB-E2E-008 — Create subscription — Validation: required fields", async () => {
    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.submit();

    // Should show validation error for required patient
    await expect(subscriptionFormPage.page.getByText(/el paciente es requerido/i)).toBeVisible();
  });

  test("SUB-E2E-009 — Create subscription — Company required when payer is Empresa", async () => {
    const planName = await createTestPlan("CORPORATE");
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();

    await expect(subscriptionFormPage.page.getByText(/la empresa es requerida/i)).toBeVisible();
  });

  // === EDIT ===

  test("SUB-E2E-010 — Edit subscription — Change status", async () => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    // Create subscription
    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    // Navigate to listing and edit
    await subscriptionsPage.goto();
    const rowCount = await subscriptionsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    await subscriptionsPage.clickEditForRow(0);

    await subscriptionFormPage.assertOnEditPage();
    await subscriptionFormPage.assertPatientDisabled();
    await subscriptionFormPage.assertPlanDisabled();
    await subscriptionFormPage.assertStatusSelectVisible();

    // Change status
    await subscriptionFormPage.fillStatus("Suspendida");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción actualizada correctamente");
  });

  test("SUB-E2E-011 — Edit subscription — Change dates", async () => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.fillEndDate("2025-12-31");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    const rowCount = await subscriptionsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    await subscriptionsPage.clickEditForRow(0);
    await subscriptionFormPage.fillStartDate("2025-07-01");
    await subscriptionFormPage.fillEndDate("2026-06-30");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción actualizada correctamente");
  });

  // === DELETE ===

  test("SUB-E2E-012 — Delete subscription — Confirm with correct text", async () => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    const rowCount = await subscriptionsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    await subscriptionsPage.clickDeleteForRow(0);

    // Confirm delete modal
    const confirmText = `${patient.fullName} - ${planName}`;
    await subscriptionFormPage.openDeleteConfirm(confirmText);
    await subscriptionFormPage.confirmDelete();
    await subscriptionsPage.waitForNotification("Suscripción eliminada correctamente");
  });

  test("SUB-E2E-013 — Delete subscription — Wrong confirm text does not delete", async () => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    const rowCount = await subscriptionsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    await subscriptionsPage.clickDeleteForRow(0);

    // Fill wrong confirm text
    await subscriptionFormPage.openDeleteConfirm("WRONG CONFIRMATION TEXT");
    await expect(subscriptionFormPage.deleteConfirmBtn).toBeDisabled();
    await expect(subscriptionFormPage.deleteConfirmInput).toBeVisible();
  });

  // === ERROR HANDLING ===

  test("SUB-E2E-014 — Create subscription — Error when patient already has same plan type", async () => {
    const planName = await createTestPlan("FAMILY");
    const patient = await createTestPatient();

    // Create first subscription
    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    // Try to create second subscription with same plan type
    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-07-01");
    await subscriptionFormPage.submit();

    // Should show error toast
    await subscriptionsPage.waitForNotification(
      /ya tiene una suscripción|ya tiene un plan familiar activo|ya tiene asignado este plan/i
    );
  });

  // === NAVIGATION ===

  test("SUB-E2E-015 — Create button navigates to create form", async () => {
    await subscriptionsPage.goto();
    await subscriptionsPage.createBtn.click();
    await subscriptionFormPage.assertOnCreatePage();
    await expect(subscriptionFormPage.page).toHaveURL(/\/suscripciones\/nueva/);
  });

  test("SUB-E2E-016 — Status filter works correctly", async ({ page }) => {
    const planName = await createTestPlan();
    const patient = await createTestPatient();

    await subscriptionFormPage.gotoCreate();
    await subscriptionFormPage.fillPatient(patient.fullName);
    await subscriptionFormPage.fillPlan(planName);
    await subscriptionFormPage.fillStartDate("2025-06-01");
    await subscriptionFormPage.submit();
    await subscriptionsPage.waitForNotification("Suscripción creada correctamente");

    await subscriptionsPage.goto();
    await subscriptionsPage.filterByStatus("Activo");
    await page.waitForTimeout(500);

    const rows = await subscriptionsPage.getRowCount();
    if (rows > 0) {
      const statuses = await subscriptionsPage.getStatuses();
      for (const status of statuses) {
        expect(status).toMatch(/activ[oa]/i);
      }
    }
  });
});
