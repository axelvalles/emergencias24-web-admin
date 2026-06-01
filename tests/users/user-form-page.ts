import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";
import { UserRoleLabels } from "~/types/users";

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
}

export class UserFormPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly submitButton: Locator;
  readonly formTitle: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByLabel("Nombre");
    this.lastNameInput = page.getByLabel("Apellido");
    this.emailInput = page.getByLabel("Correo electrónico");
    this.phoneInput = page.getByLabel("Teléfono");
    this.passwordInput = page.getByLabel(/contraseña/i);
    this.roleSelect = page.getByLabel("Rol");
    this.submitButton = page.getByRole("button", { name: /crear usuario|actualizar usuario/i });
    this.formTitle = page.getByText(/crear usuario|actualizar usuario/i).first();
    this.pageTitle = page.getByRole("heading", { name: /usuario/i }).first();
  }

  async fillForm(data: UserFormData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.password) await this.passwordInput.fill(data.password);
    if (data.role) {
      const roleLabel = UserRoleLabels[data.role as keyof typeof UserRoleLabels] ?? data.role;
      await this.roleSelect.click();
      await this.page.getByRole("option", { name: new RegExp(roleLabel, "i") }).first().click();
    }
  }

  async expectFormToBePrepopulated(data: Partial<UserFormData>): Promise<void> {
    if (data.firstName) await expect(this.firstNameInput).toHaveValue(data.firstName);
    if (data.lastName) await expect(this.lastNameInput).toHaveValue(data.lastName);
    if (data.email) await expect(this.emailInput).toHaveValue(data.email);
    if (data.role) {
      const roleLabel = UserRoleLabels[data.role as keyof typeof UserRoleLabels] ?? data.role;
      await expect(this.roleSelect).toContainText(new RegExp(roleLabel, "i"));
    }
  }

  async expectPasswordToBeOptional(): Promise<void> {
    // On edit form, password label should indicate it's optional
    const label = this.page.getByText(/contraseña.*opcional/i).or(
      this.page.getByText(/dejar.*blanco/i)
    );
    await expect(label).toBeVisible();
  }

  async expectValidationError(field: string): Promise<void> {
    const error = this.page.getByText(/requerido|inválido/i).or(
      this.page.locator(".text-destructive, .text-red-500, [role='alert']").filter({ hasText: field })
    );
    await expect(error.first()).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSuccessNotification(): Promise<void> {
    await this.waitForToast();
    const toast = this.page.locator("[data-sonner-toast], [role='alert']").first();
    await expect(toast).toBeVisible();
  }

  async expectToBeOnUsersList(): Promise<void> {
    await expect(this.page).toHaveURL(/\/usuarios/);
  }
}
