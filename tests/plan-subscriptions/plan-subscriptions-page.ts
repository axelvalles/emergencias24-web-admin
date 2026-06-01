import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class PlanSubscriptionsPage extends BasePage {
  readonly path = "/suscripciones";

  // Filters
  searchInput!: Locator;
  statusFilterTrigger!: Locator;
  payerTypeFilterTrigger!: Locator;

  // Table columns
  tableRows!: Locator;
  patientColumn!: Locator;
  planColumn!: Locator;
  payerTypeColumn!: Locator;
  statusColumn!: Locator;
  startDateColumn!: Locator;
  endDateColumn!: Locator;
  actionsColumn!: Locator;

  // Empty state
  emptyState!: Locator;

  // Create button
  createBtn!: Locator;

  constructor(page: Page) {
    super(page);
    this.initLocators();
  }

  private initLocators() {
    this.searchInput = this.page.getByPlaceholder(/buscar/i);
    this.statusFilterTrigger = this.page.getByRole("toolbar").getByRole("button", { name: /estado/i });
    this.payerTypeFilterTrigger = this.page
      .getByRole("toolbar")
      .getByRole("button", { name: /tipo de pagador/i });

    this.tableRows = this.page.locator("tbody tr");
    this.patientColumn = this.page.locator("tbody tr td:nth-child(1)");
    this.planColumn = this.page.locator("tbody tr td:nth-child(2)");
    this.payerTypeColumn = this.page.locator("tbody tr td:nth-child(3)");
    this.statusColumn = this.page.locator("tbody tr td:nth-child(4)");
    this.startDateColumn = this.page.locator("tbody tr td:nth-child(5)");
    this.endDateColumn = this.page.locator("tbody tr td:nth-child(6)");
    this.actionsColumn = this.page.locator("tbody tr td:last-child");

    this.emptyState = this.page.getByRole("heading", { name: /no se encontraron/i });
    this.createBtn = this.page.getByRole("link", { name: /nueva suscripción/i });
  }

  override async goto(): Promise<void> {
    await super.goto(this.path);
  }

  async gotoPage(page: number): Promise<void> {
    await this.page.goto(`${this.path}?page=${page}`);
    await this.page.waitForLoadState("networkidle");
  }

  async searchForSubscription(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(600); // debounce
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(600);
  }

  async filterByStatus(status: string): Promise<void> {
    const mapping: Record<string, string> = {
      activo: "ACTIVE",
      suspendida: "SUSPENDED",
      cancelada: "CANCELED",
      expirada: "EXPIRED",
    };

    const key = status.trim().toLowerCase();
    const value = mapping[key];
    if (!value) return;

    const url = new URL(this.page.url());
    url.searchParams.delete("status");
    url.searchParams.append("status", value);
    await this.page.goto(url.toString());
    await this.page.waitForLoadState("networkidle");
  }

  async filterByPayerType(payerType: string): Promise<void> {
    const mapping: Record<string, string> = {
      paciente: "PATIENT",
      empresa: "COMPANY",
    };

    const key = payerType.trim().toLowerCase();
    const value = mapping[key];
    if (!value) return;

    const url = new URL(this.page.url());
    url.searchParams.delete("payerType");
    url.searchParams.append("payerType", value);
    await this.page.goto(url.toString());
    await this.page.waitForLoadState("networkidle");
  }

  async clickEditForRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator("td:last-child button").first().click();
  }

  async clickDeleteForRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator("td:last-child button").nth(1).click();
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getPatientNames(): Promise<string[]> {
    const texts = await this.patientColumn.allTextContents();
    return texts.map((t) => t.split("\n")[0].trim());
  }

  async getStatuses(): Promise<string[]> {
    return this.statusColumn.allTextContents();
  }

  async getPlanNames(): Promise<string[]> {
    const texts = await this.planColumn.allTextContents();
    return texts.map((t) => t.split("\n")[0].trim());
  }

  async assertCreateButtonVisible(): Promise<void> {
    await expect(this.createBtn).toBeVisible();
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async assertRowCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }

  async assertSubscriptionInList(patientName: string): Promise<void> {
    await expect(this.page.getByText(patientName).first()).toBeVisible();
  }

  async assertSubscriptionNotInList(patientName: string): Promise<void> {
    await expect(this.page.getByText(patientName).first()).not.toBeVisible();
  }

  async waitForNotification(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: 10000 });
  }
}
