import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class UsersListingPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newUserButton: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page
      .getByRole("heading", { name: /usuarios?/i })
      .or(page.getByText(/^usuarios$/i))
      .first();
    this.newUserButton = page
      .getByRole("link", { name: /nuevo usuario|agregar nuevo/i })
      .or(page.getByRole("button", { name: /nuevo usuario|agregar nuevo/i }))
      .or(page.locator('a[href="/usuarios/nuevo"]').first());
    this.searchInput = page.getByPlaceholder(/buscar|i18n-search|search/i).first();
    this.tableRows = page.locator("tbody tr");
    this.emptyState = page.getByText(/no.*usuario|sin.*resultado/i);
  }

  override async goto(): Promise<void> {
    await super.goto("/usuarios");
  }

  async clickNewUser(): Promise<void> {
    await this.newUserButton.click();
  }

  async searchUsers(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState("networkidle");
  }

  async getFirstRowActions(): Promise<{
    editButton: Locator;
    activateButton: Locator;
    deleteButton: Locator;
  }> {
    const firstRow = this.tableRows.first();
    const rowActions = firstRow.locator("td").last().locator("button");

    return {
      editButton: firstRow
        .getByRole("link", { name: /editar/i })
        .or(firstRow.getByRole("button", { name: /editar/i }))
        .or(firstRow.locator('a[href*="/usuarios/editar/"]').first())
        .or(rowActions.nth(0)),
      activateButton: firstRow
        .getByRole("button", { name: /activar|desactivar/i })
        .or(rowActions.nth(1)),
      deleteButton: firstRow
        .getByRole("button", { name: /eliminar/i })
        .or(rowActions.nth(2)),
    };
  }

  async getRowActionsByEmail(email: string): Promise<{
    editButton: Locator;
    activateButton: Locator;
    deleteButton: Locator;
  }> {
    const targetRow = this.page.locator("tbody tr").filter({
      hasText: email,
    }).first();
    const rowActions = targetRow.locator("td").last().locator("button");

    return {
      editButton: targetRow
        .getByRole("link", { name: /editar/i })
        .or(targetRow.getByRole("button", { name: /editar/i }))
        .or(targetRow.locator('a[href*="/usuarios/editar/"]').first())
        .or(rowActions.nth(0)),
      activateButton: targetRow
        .getByRole("button", { name: /activar|desactivar/i })
        .or(rowActions.nth(1)),
      deleteButton: targetRow
        .getByRole("button", { name: /eliminar/i })
        .or(rowActions.nth(2)),
    };
  }

  async expectRowCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.emptyState).toBeVisible();
    } else {
      await expect(this.tableRows).toHaveCount(count, { timeout: 5000 });
    }
  }

  async expectSearchResults(query: string): Promise<void> {
    // After search, table should update
    await this.page.waitForLoadState("networkidle");
    // Verify URL has search param
    await expect(this.page).toHaveURL(new RegExp(`q=${query}`));
  }
}
