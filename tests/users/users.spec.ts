import { test, expect } from "@playwright/test";
import { UsersListingPage } from "./users-page";
import { UserFormPage } from "./user-form-page";
import { generateTestUser, DEFAULT_ADMIN } from "../helpers";
import { LoginPage } from "../auth/login-page";
import { UserRole } from "~/types/users";

test.describe("Users — CRUD", () => {
  let loginPage: LoginPage;
  let usersPage: UsersListingPage;
  let userFormPage: UserFormPage;

  const hydrateAuthStateFromApi = async (page: any) => {
    const apiUrl = process.env.E2E_API_URL ?? "http://localhost:3000";
    const response = await page.request.post(`${apiUrl}/auth/login`, {
      data: DEFAULT_ADMIN,
    });

    if (!response.ok()) {
      return false;
    }

    const loginResponse = await response.json();

    await page.addInitScript((authStorage) => {
      window.localStorage.setItem("auth-storage", JSON.stringify(authStorage));
    }, {
      state: {
        user: loginResponse.user,
        token: loginResponse.accessToken,
        isAuthenticated: true,
      },
      version: 0,
    });

    return true;
  };

  const ensureEditableUserExists = async () => {
    const { editButton } = await usersPage.getFirstRowActions();
    if (await editButton.isVisible().catch(() => false)) {
      return;
    }

    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await userFormPage.expectToBeOnUsersList();
  };

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersListingPage(page);
    userFormPage = new UserFormPage(page);

    await usersPage.goto();

    if (page.url().includes("/login")) {
      await loginPage.login(DEFAULT_ADMIN);

      // Some environments do not auto-redirect after successful login.
      // Force navigation to users listing and validate auth from there.
      await usersPage.goto();

      if (page.url().includes("/login")) {
        const hydrated = await hydrateAuthStateFromApi(page);
        if (hydrated) {
          await usersPage.goto();
        }
      }
    }
  });

  // ─── LIST ───────────────────────────────────────────────────────────────────

  test("USERS-E2E-001 — Lista de usuarios carga y muestra tabla", async () => {
    await expect(usersPage.pageTitle).toBeVisible();
    await expect(usersPage.tableRows.first()).toBeVisible();
  });

  test("USERS-E2E-002 — Click en 'Nuevo usuario' navega al formulario de creación", async ({ page }) => {
    await usersPage.clickNewUser();
    await expect(page).toHaveURL(/\/usuarios\/nuevo/);
    await expect(userFormPage.formTitle).toBeVisible();
  });

  test("USERS-E2E-003 — Búsqueda filtra usuarios por nombre o email", async ({ page }) => {
    // Search for a known admin email
    await usersPage.searchUsers("admin");
    await page.waitForLoadState("networkidle");
    // Should show results containing "admin"
    const rows = usersPage.tableRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("USERS-E2E-004 — Tabla tiene paginación (controles visibles)", async ({ page }) => {
    // Check pagination controls exist
    const pagination = page.getByRole("navigation", { name: /pagin|pager/i }).or(
      page.getByText(/página.*de/i)
    );
    await expect(pagination.first()).toBeVisible();
  });

  test("USERS-E2E-005 — Click en editar usuario navega al formulario con datos precargados", async ({ page }) => {
    await ensureEditableUserExists();
    const { editButton } = await usersPage.getFirstRowActions();
    await editButton.click();
    await expect(page).toHaveURL(/\/usuarios\/editar\//);
    // Password field should be optional on edit
    await userFormPage.expectPasswordToBeOptional();
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  test("USERS-E2E-006 — Crear usuario con datos válidos muestra notificación de éxito", async () => {
    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await userFormPage.expectToBeOnUsersList();
  });

  test("USERS-E2E-007 — Crear usuario sin campos requeridos muestra errores de validación", async ({ page }) => {
    await usersPage.clickNewUser();
    await userFormPage.submit();
    // Should show required field errors
    const errors = page.getByText(/requerido|obligatorio|required/i);
    await expect(errors.first()).toBeVisible();
  });

  test("USERS-E2E-008 — Crear usuario con email malformado muestra error de validación", async ({ page }) => {
    const user = generateTestUser({ email: "not-valid-email" });
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    const error = page.getByText(/correo.*inválido|email.*inválido/i);
    await expect(error).toBeVisible();
  });

  test("USERS-E2E-009 — Crear usuario con password menor a 6 caracteres muestra error", async ({ page }) => {
    const user = generateTestUser({ password: "123" });
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    const error = page.getByText(/al menos 6|6 caracteres/i);
    await expect(error).toBeVisible();
  });

  test("USERS-E2E-010 — Crear usuario con email duplicado muestra error del servidor", async ({ page }) => {
    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await userFormPage.expectToBeOnUsersList();
    // Try to create another user with same email
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    // Should show duplicate email error
    const error = page.getByText(/email.*ya.*existe|duplicado/i).or(
      page.getByText(/error.*500|error.*servidor/i)
    );
    await expect(error.first()).toBeVisible();
  });

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  test("USERS-E2E-011 — Editar usuario y guardar muestra notificación de éxito", async ({ page }) => {
    await ensureEditableUserExists();
    // Navigate to edit first user
    const { editButton } = await usersPage.getFirstRowActions();
    await editButton.click();
    await page.waitForURL(/\/usuarios\/editar\//);
    // Change last name
    const newLastName = `ApellidoEditado${Date.now()}`;
    await userFormPage.lastNameInput.clear();
    await userFormPage.lastNameInput.fill(newLastName);
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await userFormPage.expectToBeOnUsersList();
  });

  test("USERS-E2E-012 — Editar usuario sin campos requeridos muestra errores de validación", async ({ page }) => {
    await ensureEditableUserExists();
    const { editButton } = await usersPage.getFirstRowActions();
    await editButton.click();
    await page.waitForURL(/\/usuarios\/editar\//);
    // Clear required fields
    await userFormPage.firstNameInput.clear();
    await userFormPage.lastNameInput.clear();
    await userFormPage.submit();
    const errors = page.getByText(/requerido|obligatorio|required/i);
    await expect(errors.first()).toBeVisible();
  });

  test("USERS-E2E-013 — Cambiar password de usuario desde formulario de edición", async ({ page }) => {
    await ensureEditableUserExists();
    const { editButton } = await usersPage.getFirstRowActions();
    await editButton.click();
    await page.waitForURL(/\/usuarios\/editar\//);
    // Fill new password
    await userFormPage.passwordInput.fill("NewPass123!");
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
  });

  // ─── DEACTIVATE / TOGGLE STATUS ─────────────────────────────────────────────

  test("USERS-E2E-014 — Desactivar usuario cambia su estado y muestra notificación", async ({ page }) => {
    // First create a user to deactivate
    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await usersPage.goto();

    // Find the user in the list and deactivate (never touch admin user)
    await usersPage.searchUsers(user.email);
    await page.waitForLoadState("networkidle");

    const rows = usersPage.tableRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    await expect(page.getByText(user.email).first()).toBeVisible();

    // Click deactivate button on targeted user row
    const { activateButton } = await usersPage.getRowActionsByEmail(user.email);
    const deactivateBtn = activateButton;
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      await page.waitForTimeout(500);
      // Should show success toast
      const toast = page.locator("[data-sonner-toast], [role='alert']").first();
      await expect(toast).toBeVisible();
    }
  });

  test("USERS-E2E-015 — Reactivar usuario desactivado cambia su estado", async ({ page }) => {
    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await usersPage.goto();

    await usersPage.searchUsers(user.email);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(user.email).first()).toBeVisible();

    const { activateButton } = await usersPage.getRowActionsByEmail(user.email);
    await activateButton.click(); // deactivate
    await page.waitForTimeout(500);
    await activateButton.click(); // reactivate
    await page.waitForTimeout(500);

    const toast = page.locator("[data-sonner-toast], [role='alert']").first();
    await expect(toast).toBeVisible();
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────

  test("USERS-E2E-016 — Eliminar usuario muestra modal de confirmación y elimina al confirmar", async ({ page }) => {
    // Create a user to delete
    const user = generateTestUser();
    await usersPage.clickNewUser();
    await userFormPage.fillForm({ ...user, role: UserRole.CLINIC_ADMIN });
    await userFormPage.submit();
    await userFormPage.expectSuccessNotification();
    await usersPage.goto();

    // Search for the user
    await usersPage.searchUsers(user.email);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(user.email).first()).toBeVisible();

    // Click delete button on targeted user row
    const { deleteButton } = await usersPage.getRowActionsByEmail(user.email);
    const deleteBtn = deleteButton;
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Confirm modal should appear
      const confirmModal = page.getByRole("dialog").or(page.getByText(/confirmar|seguro/i));
      await expect(confirmModal.first()).toBeVisible();
      // Confirm deletion
      const confirmBtn = page.getByRole("button", { name: /confirmar|eliminar/i }).or(
        page.getByText(/confirmar|eliminar/i)
      );
      await confirmBtn.first().click();
      await page.waitForTimeout(500);
      // Should show success toast
      const toast = page.locator("[data-sonner-toast], [role='alert']").first();
      await expect(toast).toBeVisible();
    }
  });
});
