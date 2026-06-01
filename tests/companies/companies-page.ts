import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class CompaniesListingPage extends BasePage {
  readonly path = "/empresas";
  readonly pageTitle: Locator;
  readonly newCompanyButton: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /empresa/i }).first();
    this.newCompanyButton = page.getByRole("link", { name: /nueva empresa/i }).or(
      page.getByRole("button", { name: /nueva empresa/i })
    );
    this.searchInput = page.getByPlaceholder(/buscar/i).first();
    this.tableRows = page.locator("tbody tr");
    this.emptyState = page.getByText(/no.*empresa|sin.*resultado/i);
  }

  override async goto(): Promise<void> {
    await super.goto(this.path);
  }

  async clickNewCompany(): Promise<void> {
    await this.newCompanyButton.click();
  }

  async searchCompanies(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState("networkidle");
  }

  async getFirstRowActions(): Promise<{
    editButton: Locator;
  }> {
    const firstRow = this.tableRows.first();
    return {
      editButton: firstRow
        .getByRole("link", { name: /editar/i })
        .or(firstRow.getByRole("button").first()),
    };
  }

  async expectRowCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.emptyState).toBeVisible();
    } else {
      await expect(this.tableRows).toHaveCount(count, { timeout: 5000 });
    }
  }
}
