import { test, expect } from "@playwright/test";

const plan = {
  id: "plan-family-contract",
  name: "Plan familiar E2E",
  planType: "FAMILY",
  billingPeriod: "MONTHLY",
  monthlyCost: 95000,
  beneficiaryCapacity: 4,
  status: "ACTIVE",
  createdAt: "2026-10-17T00:00:00.000Z",
};

const beneficiary = {
  id: "patient-beneficiary",
  firstName: "María",
  lastName: "Prueba",
  fullName: "María Prueba",
  documentType: "CC",
  documentNumber: "12345678",
};

test("creates an independent payer and a package contract for patient beneficiaries", async ({
  page,
}) => {
  let individualPayerPayload: unknown;
  let individualPayerCreateRequests = 0;
  let contractPayload: unknown;
  let contractAttempts = 0;
  let patientCreateRequests = 0;

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: { role: "admin" },
          token: "e2e-token",
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  });

  await page.route("**/plan-subscriptions**", (route) => {
    if (new URL(route.request().url()).pathname !== "/plan-subscriptions") {
      return route.continue();
    }
    return route.fulfill({
      json: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  });
  await page.route("**/plans**", (route) => {
    if (new URL(route.request().url()).pathname !== "/plans") {
      return route.continue();
    }
    return route.fulfill({
      json: { data: [plan], total: 1, page: 1, limit: 100, totalPages: 1 },
    });
  });
  await page.route("**/patients**", async (route) => {
    if (new URL(route.request().url()).pathname !== "/patients") {
      return route.continue();
    }
    if (route.request().method() === "POST") {
      patientCreateRequests += 1;
      return route.fulfill({ status: 500, json: { message: "Unexpected patient creation" } });
    }
    return route.fulfill({
      json: {
        data: [beneficiary],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    });
  });
  await page.route("**/individual-payers**", async (route) => {
    if (new URL(route.request().url()).pathname !== "/individual-payers") {
      return route.continue();
    }
    if (route.request().method() === "POST") {
      individualPayerCreateRequests += 1;
      individualPayerPayload = route.request().postDataJSON() as unknown;
      return route.fulfill({
        json: {
          id: "individual-payer-juan",
          firstName: "Juan",
          lastName: "García",
          fullName: "Juan García",
          documentType: "PASSPORT",
          documentNumber: "P-123456",
          linkedPatient: null,
        },
      });
    }
    return route.fulfill({
      json: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    });
  });
  await page.route("**/plan-contracts**", async (route) => {
    if (new URL(route.request().url()).pathname !== "/plan-contracts") {
      return route.continue();
    }
    contractAttempts += 1;
    contractPayload = route.request().postDataJSON() as unknown;
    if (contractAttempts === 1) {
      return route.fulfill({ status: 500, json: { message: "Temporary contract failure" } });
    }
    return route.fulfill({
      json: {
        id: "contract-family-1",
        status: "ACTIVE",
        fixedPrice: "95000.00",
        billingPeriod: "MONTHLY",
        capacity: 4,
        startDate: "2026-10-17",
        endDate: null,
        plan: { id: plan.id, name: plan.name, planType: "FAMILY" },
        payer: {
          id: "individual-payer-juan",
          firstName: "Juan",
          lastName: "García",
          fullName: "Juan García",
          documentType: "PASSPORT",
          documentNumber: "P-123456",
        },
        beneficiaries: [beneficiary],
      },
    });
  });

  await page.goto("/suscripciones");
  const createContractLink = page.getByRole("link", {
    name: "Nuevo contrato de paquete",
  });
  await expect(createContractLink).toBeVisible();
  await createContractLink.click();

  await expect(
    page.getByRole("heading", {
      name: "Nuevo contrato de paquete familiar o grupal",
    }),
  ).toBeVisible();

  await page.locator("#contract-plan").selectOption(plan.id);
  await page.getByLabel("Nombres del pagador").fill("Juan");
  await page.getByLabel("Apellidos del pagador").fill("García");
  await page.getByLabel("Tipo de documento del pagador").selectOption("PASSPORT");
  await page.getByLabel("Número de documento del pagador").fill("P-123456");
  await page.getByLabel("Buscar pacientes beneficiarios").fill("María");
  await page.getByRole("checkbox", { name: /María Prueba/ }).check();
  await page.getByLabel("Fecha de inicio").fill("2026-10-17");
  await page.getByRole("button", { name: "Crear contrato" }).click();

  await expect(page.getByRole("alert")).toContainText("El pagador quedó registrado");
  await expect(page.getByRole("button", { name: "Reintentar creación del contrato" })).toBeVisible();
  await page.getByRole("button", { name: "Reintentar creación del contrato" }).click();

  await expect(page.getByText("Contrato de paquete creado correctamente")).toBeVisible();
  expect(individualPayerPayload).toMatchObject({
    firstName: "Juan",
    lastName: "García",
    documentType: "PASSPORT",
    documentNumber: "P-123456",
  });
  expect(individualPayerPayload).not.toHaveProperty("linkedPatientId");
  expect(individualPayerPayload).not.toHaveProperty("patientId");
  expect(contractPayload).toMatchObject({
    planId: plan.id,
    individualPayerId: "individual-payer-juan",
    beneficiaryPatientIds: [beneficiary.id],
    startDate: "2026-10-17",
  });
  expect(patientCreateRequests).toBe(0);
  expect(individualPayerCreateRequests).toBe(1);
  expect(contractAttempts).toBe(2);
});
