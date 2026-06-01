import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class PlansPage extends BasePage {
  readonly path = "/planes";

  // Filters
  searchInput!: Locator;
  planTypeFilterTrigger!: Locator;
  statusFilterTrigger!: Locator;
  clearFiltersBtn!: Locator;

  // Table
  tableRows!: Locator;
  nameColumn!: Locator;
  typeColumn!: Locator;
  statusColumn!: Locator;
  subscriptionsColumn!: Locator;
  costColumn!: Locator;
  actionsColumn!: Locator;

  // Actions per row
  editBtn!: Locator;
  activateDeactivateBtn!: Locator;
  deleteBtn!: Locator;

  // Pagination
  prevPageBtn!: Locator;
  nextPageBtn!: Locator;
  pageInfo!: Locator;

  // Empty state
  emptyState!: Locator;

  // Create button
  createBtn!: Locator;

  constructor(page: Page) {
    super(page);
    this.initLocators();
  }

  private initLocators() {
    // The plan listing uses a DataTable with: placeholder="Buscar por nombre o descripcion..."
    this.searchInput = this.page.getByPlaceholder(/Buscar por nombre o descripcion/i);
    this.planTypeFilterTrigger = this.page.getByRole("button", { name: /tipo de plan/i });
    this.statusFilterTrigger = this.page.getByRole("toolbar").getByRole("button", { name: /^Estado$/i });
    this.clearFiltersBtn = this.page.getByRole("button", { name: /reiniciar filtros/i }).or(
      this.page.getByRole("button", { name: /reiniciar/i })
    );

    this.tableRows = this.page.locator("tbody tr");
    this.nameColumn = this.page.locator("tbody tr td:nth-child(1)");
    this.typeColumn = this.page.locator("tbody tr td:nth-child(2)");
    this.statusColumn = this.page.locator("tbody tr td:nth-child(3)");
    this.subscriptionsColumn = this.page.locator("tbody tr td:nth-child(4)");
    this.costColumn = this.page.locator("tbody tr td:nth-child(5)");
    this.actionsColumn = this.page.locator("tbody tr td:last-child");

    this.editBtn = this.page.getByRole("button", { name: /editar plan/i });
    this.activateDeactivateBtn = this.page.getByRole("button", { name: /(des)?activar plan/i });
    this.deleteBtn = this.page.getByRole("button", { name: /eliminar plan/i });

    this.prevPageBtn = this.page.getByRole("button", { name: /página anterior/i });
    this.nextPageBtn = this.page.getByRole("button", { name: /siguiente página/i });
    this.pageInfo = this.page.locator("[class*='text-muted-foreground']", { hasText: /de \d+/ });

    this.emptyState = this.page.getByRole("heading", { name: /no se encontraron planes/i });
    this.createBtn = this.page.getByRole("link", { name: /nuevo plan/i });
  }

  override async goto(): Promise<void> {
    await super.goto(this.path);
  }

  async gotoPage(page: number): Promise<void> {
    await this.page.goto(`${this.path}?page=${page}`);
    await this.page.waitForLoadState("networkidle");
  }

  async searchForPlan(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.page.waitForTimeout(600); // debounce
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(600);
  }

  async filterByPlanType(type: string): Promise<void> {
    await this.planTypeFilterTrigger.click();
    await this.page.getByRole("option", { name: new RegExp(type, "i") }).click();
    await this.page.keyboard.press("Escape");
  }

  async filterByStatus(status: "Activo" | "Inactivo"): Promise<void> {
    await this.statusFilterTrigger.click();
    const statusPopover = this.page
      .locator("[data-slot='popover-content']")
      .filter({ hasText: /Activo|Inactivo/i })
      .last();
    const clearFilters = statusPopover.getByText(/limpiar filtros/i);
    if (await clearFilters.isVisible().catch(() => false)) {
      await clearFilters.click();
    }
    await statusPopover.getByText(status, { exact: true }).click();
    await this.page.keyboard.press("Escape");
  }

  async clickEditForRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator("button").first().click();
  }

  async clickActivateDeactivateForRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator("button").nth(1).click();
  }

  async clickDeleteForRow(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator("button").nth(2).click();
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getPlanNames(): Promise<string[]> {
    return this.nameColumn.allTextContents();
  }

  async getPlanStatuses(): Promise<string[]> {
    return this.statusColumn.allTextContents();
  }

  async getSubscriptionCounts(): Promise<number[]> {
    const texts = await this.subscriptionsColumn.allTextContents();
    return texts.map((t) => {
      const match = t.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
  }

  async waitForNotification(message: string): Promise<void> {
    await this.page.waitForSelector(`text=${message}`, { timeout: 15000 });
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

  async assertPlanInList(planName: string): Promise<void> {
    await expect(this.page.getByText(planName).first()).toBeVisible();
  }

  async assertPlanNotInList(planName: string): Promise<void> {
    await expect(this.page.getByText(planName).first()).not.toBeVisible();
  }

  async assertStatusBadgeForRow(rowIndex: number, expectedStatus: "Activo" | "Inactivo"): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await expect(row.locator("text=" + expectedStatus)).toBeVisible();
  }
}
