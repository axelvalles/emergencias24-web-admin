import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../base-page";

export interface LoginData {
  email: string;
  password: string;
}

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel("Correo electrónico");
    this.passwordInput = page.getByLabel("Contraseña");
    this.submitButton = page.getByRole("button", { name: "Iniciar sesión" });
    this.emailLabel = page.getByText("Correo electrónico").first();
    this.passwordLabel = page.getByText("Contraseña").first();
  }

  override async goto(): Promise<void> {
    await super.goto("/login");
  }

  async login(data: LoginData): Promise<void> {
    // If already authenticated (redirected from /login), skip login
    if (!this.page.url().includes("/login")) {
      return;
    }
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.submitButton.click();
  }

  async expectToBeLoggedIn(): Promise<void> {
    // After login, should redirect away from /login
    // Use longer timeout since React Router client-side navigation can be slow
    await this.page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  }

  async expectLoginError(): Promise<void> {
    // Wait for error toast - Sonner toasts have data-sonner-toast attribute
    // The toast should be visible and contain error-related text
    const toast = this.page.locator("[data-sonner-toast]").first();
    await toast.waitFor({ state: "visible", timeout: 8000 });
 }

  async expectSubmitButtonToBeDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async expectSubmitButtonToBeEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled();
  }
}
