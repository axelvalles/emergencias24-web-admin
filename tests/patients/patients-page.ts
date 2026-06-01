import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class PatientsListingPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newPatientButton: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly emptyState: Locator;
  readonly downloadTemplateButton: Locator;
  readonly uploadTemplateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /paciente/i }).first();
    this.newPatientButton = page.getByRole("link", { name: /agregar nuevo/i }).or(
      page.getByRole("button", { name: /agregar nuevo/i })
    );
    this.searchInput = page.getByPlaceholder(/buscar/i).first();
    this.tableRows = page.locator("tbody tr");
    this.emptyState = page.getByText(/no.*paciente|sin.*resultado/i);
    this.downloadTemplateButton = page.getByRole("button", { name: /^descargar\s+plantilla$/i });
    this.uploadTemplateButton = page.getByRole("button", { name: /^cargar\s+plantilla$/i });
  }

  override async goto(): Promise<void> {
    await super.goto("/pacientes");
  }

  async clickNewPatient(): Promise<void> {
    await this.newPatientButton.click();
  }

  async searchPatients(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState("networkidle");
  }

  async getFirstRowActions(): Promise<{
    editButton: Locator;
  }> {
    const firstRow = this.tableRows.first();
    return {
      editButton: firstRow.getByRole("link", { name: /editar/i }).or(
        firstRow.getByRole("button", { name: /editar/i })
      ).or(
        firstRow.locator("a[href*='/pacientes/editar/']").first()
      ).or(
        firstRow.locator("td").last().getByRole("button").first()
      ),
    };
  }

  async expectRowCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.emptyState).toBeVisible();
    } else {
      await expect(this.tableRows).toHaveCount(count, { timeout: 5000 });
    }
  }

  async downloadTemplate(): Promise<void> {
    await this.downloadTemplateButton.click();
    await this.page.waitForTimeout(1000); // Wait for download to start
  }

  async uploadTemplate(filePath: string): Promise<void> {
    const input = this.page.locator("#patient-import-input");
    await input.setInputFiles(filePath);
    await this.page.waitForLoadState("networkidle");
  }
}
