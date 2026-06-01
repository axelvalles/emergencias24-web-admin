import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class CompanyFormPage extends BasePage {
  readonly path = "/empresas";
  readonly nameInput: Locator;
  readonly taxIdInput: Locator;
  readonly contactEmailInput: Locator;
  readonly contactPhoneInput: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/nombre.*empresa/i);
    this.taxIdInput = page.getByLabel(/nit|tax id/i);
    this.contactEmailInput = page.getByLabel(/email.*contacto/i);
    this.contactPhoneInput = page.getByLabel(/teléfono.*contacto/i);
    this.submitButton = page.getByRole("button", { name: /crear|actualizar.*empresa/i });
    this.successToast = page.locator("[data-sonner-toast]");
  }

  async gotoCreate(): Promise<void> {
    await this.page.goto(`${this.path}/nueva`);
    await this.page.waitForLoadState("networkidle");
  }

  async gotoEdit(companyId: string): Promise<void> {
    await this.page.goto(`${this.path}/editar/${companyId}`);
    await this.page.waitForLoadState("networkidle");
  }

  async fillForm(data: {
    name: string;
    taxId: string;
    contactEmail: string;
    contactPhone: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.taxIdInput.fill(data.taxId);
    await this.contactEmailInput.fill(data.contactEmail);
    await this.contactPhoneInput.fill(data.contactPhone);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSuccessNotification(): Promise<void> {
    await this.successToast.first().waitFor({ state: "visible", timeout: 8000 });
  }

  async expectToBeOnCompaniesList(): Promise<void> {
    await expect(this.page).toHaveURL(/\/empresas(?:\?.*)?$/);
  }

  async expectNameRequiredError(): Promise<void> {
    const error = this.page.getByText(/nombre.*al menos|al menos 3 caracteres/i);
    await expect(error.first()).toBeVisible();
  }

  async expectEmailInvalidError(): Promise<void> {
    const error = this.page.getByText(/email.*inv[aá]lido/i);
    await expect(error.first()).toBeVisible();
  }
}
