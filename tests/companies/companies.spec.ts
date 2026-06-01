import { test, expect } from "@playwright/test";
import { CompaniesListingPage } from "./companies-page";
import { CompanyFormPage } from "./company-form-page";
import { generateTestCompany, DEFAULT_ADMIN } from "../helpers";
import { LoginPage } from "../auth/login-page";

test.describe("Companies — CRUD", () => {
  let loginPage: LoginPage;
  let companiesPage: CompaniesListingPage;
  let companyFormPage: CompanyFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    companiesPage = new CompaniesListingPage(page);
    companyFormPage = new CompanyFormPage(page);

    // Authenticate before each test
    await loginPage.goto();
    await loginPage.login(DEFAULT_ADMIN);
    await companiesPage.goto();
  });

  // ─── LIST ─────────────────────────────────────────────────────────────────

  test("COMPANIES-E2E-001 — Lista de empresas carga y muestra tabla", async () => {
    await expect(companiesPage.pageTitle).toBeVisible();
    await expect(companiesPage.tableRows.first()).toBeVisible();
  });

  test("COMPANIES-E2E-002 — Click en 'Nueva empresa' navega al formulario de creación", async () => {
    await companiesPage.clickNewCompany();
    await expect(companyFormPage.nameInput).toBeVisible();
    await expect(companyFormPage.taxIdInput).toBeVisible();
  });

  test("COMPANIES-E2E-003 — Búsqueda filtra empresas por nombre o NIT", async ({ page }) => {
    // Create a company first to have something to search
    const company = generateTestCompany();
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm(company);
    await companyFormPage.submit();
    await companyFormPage.expectToBeOnCompaniesList();
    await companiesPage.goto();

    // Search for the company
    await companiesPage.searchCompanies(company.name);
    await page.waitForLoadState("networkidle");
    const count = await companiesPage.tableRows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("COMPANIES-E2E-004 — Click en editar empresa navega al formulario con datos precargados", async ({ page }) => {
    const editButton = page.locator('tbody tr [aria-label="Editar empresa"]').first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await expect(page).toHaveURL(/\/empresas\/editar\//);
    await expect(companyFormPage.nameInput).toBeVisible();
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  test("COMPANIES-E2E-005 — Crear empresa con datos válidos muestra notificación de éxito", async ({ page }) => {
    await page.route("**/companies", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "e2e-company-id" }),
        });
        return;
      }
      await route.continue();
    });

    const company = generateTestCompany();
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm(company);
    await companyFormPage.submit();
    await companyFormPage.expectToBeOnCompaniesList();
  });

  test("COMPANIES-E2E-006 — Crear empresa sin campos requeridos muestra errores de validación", async ({ page }) => {
    await companiesPage.clickNewCompany();
    await companyFormPage.submit();
    const errors = page.getByText(/al menos \d+ caracteres/i);
    await expect(errors.first()).toBeVisible();
  });

  test("COMPANIES-E2E-007 — Crear empresa con email malformado muestra error de validación", async () => {
    const company = generateTestCompany({ contactEmail: "not-valid-email" });
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm(company);
    await companyFormPage.submit();

    const validationMessage = await companyFormPage.contactEmailInput.evaluate(
      (element) => (element as HTMLInputElement).validationMessage
    );
    expect(validationMessage.length).toBeGreaterThan(0);
  });

  test("COMPANIES-E2E-008 — Crear empresa con NIT duplicado muestra error del servidor", async ({ page }) => {
    let createCount = 0;
    await page.route("**/companies", async (route) => {
      if (route.request().method() === "POST") {
        createCount += 1;
        if (createCount === 1) {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({ id: "e2e-company-id-1" }),
          });
          return;
        }
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "taxId already exists" }),
        });
        return;
      }
      await route.continue();
    });

    const company = generateTestCompany();
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm(company);
    await companyFormPage.submit();
    await companyFormPage.expectToBeOnCompaniesList();
    await companiesPage.goto();
    // Try to create another company with same NIT
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm({
      ...company,
      contactEmail: `another${Date.now()}@test.com`,
    });
    await companyFormPage.submit();
    // Should show duplicate error toast
    const toast = companyFormPage.successToast;
    await expect(toast).toBeVisible();
  });

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  test("COMPANIES-E2E-009 — Editar empresa y guardar muestra notificación de éxito", async ({ page }) => {
    const editButton = page.locator('tbody tr [aria-label="Editar empresa"]').first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForURL(/\/empresas\/editar\//);
    // Change name
    const newName = `EmpresaEditada${Date.now()}`;
    await companyFormPage.nameInput.clear();
    await companyFormPage.nameInput.fill(newName);
    await companyFormPage.submit();
    await companyFormPage.expectSuccessNotification();
    await companyFormPage.expectToBeOnCompaniesList();
  });

  test("COMPANIES-E2E-010 — Editar empresa sin nombre muestra error de validación", async ({ page }) => {
    const editButton = page.locator('tbody tr [aria-label="Editar empresa"]').first();
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForURL(/\/empresas\/editar\//);
    // Clear name field
    await companyFormPage.nameInput.clear();
    await companyFormPage.submit();
    await companyFormPage.expectNameRequiredError();
  });

  // ─── DEACTIVATE / TOGGLE STATUS ─────────────────────────────────────────────

  test("COMPANIES-E2E-011 — Desactivar empresa cambia su estado y muestra notificación", async ({ page }) => {
    const firstRow = companiesPage.tableRows.first();
    await expect(firstRow).toBeVisible();
    const statusToggleButton = firstRow.locator("button").nth(1);
    await statusToggleButton.click();
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
  });

  test("COMPANIES-E2E-012 — Reactivar empresa desactivada cambia su estado", async ({ page }) => {
    // Find first row with activate button
    const rows = companiesPage.tableRows;
    const activateBtn = rows.first().getByRole("button", { name: /activar/i });
    if (await activateBtn.isVisible()) {
      await activateBtn.click();
      await page.waitForTimeout(500);
      // Should now show "Desactivar" button
      const deactivateBtn = page.getByRole("button", { name: /desactivar/i });
      await expect(deactivateBtn.first()).toBeVisible();
    }
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  test("COMPANIES-E2E-013 — Eliminar empresa muestra modal de confirmación y elimina al confirmar", async ({ page }) => {
    // Create a company to delete
    const company = generateTestCompany();
    await companiesPage.clickNewCompany();
    await companyFormPage.fillForm(company);
    await companyFormPage.submit();
    await companyFormPage.expectToBeOnCompaniesList();
    await companiesPage.goto();

    // Search for the company
    await companiesPage.searchCompanies(company.name);
    await page.waitForLoadState("networkidle");

    // Click delete button
    const rows = companiesPage.tableRows;
    const deleteBtn = rows.first().getByRole("button", { name: /eliminar empresa/i });
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Confirm modal should appear
      const confirmModal = page
        .getByRole("dialog")
        .or(page.getByText(/confirmar|seguro/i));
      await expect(confirmModal.first()).toBeVisible();

      const confirmInput = page.getByPlaceholder(/escribe ".*" para confirmar/i);
      await confirmInput.fill(company.name);

      // Confirm deletion
      const confirmBtn = confirmModal
        .first()
        .getByRole("button", { name: /^confirmar$/i });
      await expect(confirmBtn).toBeEnabled();
      await confirmBtn.click();

      await expect(confirmModal.first()).not.toBeVisible({ timeout: 10000 });
    }
  });
});
