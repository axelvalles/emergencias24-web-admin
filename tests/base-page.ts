import { type Page, type Locator, expect } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
  }

  async waitForNotification(): Promise<void> {
    await this.page.waitForSelector('[role="status"]', { timeout: 5000 });
  }

  async getNotificationMessage(): Promise<string> {
    const notification = this.page.locator('[role="status"]');
    await notification.waitFor({ state: "visible" });
    return notification.textContent() ?? "";
  }

  async isOnPage(path: string): Promise<boolean> {
    return this.page.url().includes(path);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async clickButton(name: string): Promise<void> {
    await this.page.getByRole("button", { name }).click();
  }

  async fillInput(label: string, value: string): Promise<void> {
    await this.page.getByLabel(label).fill(value);
  }

  async expectInputToHaveValue(label: string, value: string): Promise<void> {
    const input = this.page.getByLabel(label);
    await expect(input).toHaveValue(value);
  }

  async expectToBeOnUrl(path: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  async expectToHaveTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(title));
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.locator("[data-sonner-toast], .toast, [role='alert']").first();
    return toast.textContent() ?? "";
  }

  async waitForToast(): Promise<void> {
    await this.page.waitForSelector("[data-sonner-toast], .toast, [role='alert']", { timeout: 5000 });
  }
}
