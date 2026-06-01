import { type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class PlanSubscriptionFormPage extends BasePage {
  // Mode selector buttons
  modeIndividualBtn!: Locator;
  modeEmpresarialBtn!: Locator;
  modeGroupBtn!: Locator;

  // Form fields
  patientSelect!: Locator;
  planSelect!: Locator;
  payerTypeSelect!: Locator;
  companySelect!: Locator;
  statusSelect!: Locator;
  startDateInput!: Locator;
  endDateInput!: Locator;

  // Submit buttons
  submitBtn!: Locator;
  createSubmitBtn!: Locator;
  updateSubmitBtn!: Locator;

  // Delete modal
  deleteConfirmInput!: Locator;
  deleteConfirmBtn!: Locator;

  constructor(page: import("@playwright/test").Page) {
    super(page);
    this.initLocators();
  }

  private initLocators() {
    this.modeIndividualBtn = this.page.getByRole("button", { name: /individual/i });
    this.modeEmpresarialBtn = this.page.getByRole("button", { name: /empresarial/i });
    this.modeGroupBtn = this.page.getByRole("button", { name: /colectivo/i });

    this.patientSelect = this.page.getByLabel(/paciente/i);
    this.planSelect = this.page.getByLabel(/plan/i).first();
    this.payerTypeSelect = this.page.getByLabel(/tipo de pagador/i);
    this.companySelect = this.page.getByLabel(/empresa/i);
    this.statusSelect = this.page.getByLabel(/estado/i);
    this.startDateInput = this.page.getByLabel(/fecha de inicio/i);
    this.endDateInput = this.page.getByLabel(/fecha de fin/i);

    this.submitBtn = this.page.getByRole("button", { name: /(crear|actualizar) suscripción/i });
    this.createSubmitBtn = this.page.getByRole("button", { name: /crear suscripción/i });
    this.updateSubmitBtn = this.page.getByRole("button", { name: /actualizar suscripción/i });
  }

  // Navigation
  async gotoCreate(): Promise<void> {
    await this.page.goto("/suscripciones/nueva");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoCreateWithPatient(patientId: string): Promise<void> {
    await this.page.goto(`/suscripciones/nueva?patientId=${patientId}`);
    await this.page.waitForLoadState("networkidle");
  }

  async gotoEdit(subscriptionId: string): Promise<void> {
    await this.page.goto(`/suscripciones/editar/${subscriptionId}`);
    await this.page.waitForLoadState("networkidle");
  }

  // Mode selection
  async selectMode(mode: "FAMILY" | "CORPORATE" | "GROUP"): Promise<void> {
    switch (mode) {
      case "FAMILY":
        await this.modeIndividualBtn.click();
        break;
      case "CORPORATE":
        await this.modeEmpresarialBtn.click();
        break;
      case "GROUP":
        await this.modeGroupBtn.click();
        break;
    }
    await this.page.waitForTimeout(300); // wait for plan options to update
  }

  // Fill form fields
  async fillPatient(patientName: string): Promise<void> {
    await this.patientSelect.click();
    await this.page.getByRole("option", { name: new RegExp(patientName, "i") }).click();
  }

  async fillPlan(planName: string): Promise<void> {
    if (planName.includes("_CORPORATE_")) {
      await this.selectMode("CORPORATE");
    } else if (planName.includes("_GROUP_")) {
      await this.selectMode("GROUP");
    } else if (planName.includes("_FAMILY_")) {
      await this.selectMode("FAMILY");
    }

    await expect(this.planSelect).toBeVisible();
    await expect(this.planSelect).toBeEnabled();
    await this.planSelect.click();
    await this.page.getByRole("option", { name: new RegExp(planName, "i") }).click();
  }

  async fillPayerType(payerType: string): Promise<void> {
    await expect(this.payerTypeSelect).toBeVisible();
    await expect(this.payerTypeSelect).toBeEnabled();
    await this.payerTypeSelect.click();
    await this.page.getByRole("option", { name: new RegExp(payerType, "i") }).click();
  }

  async fillCompany(companyName: string): Promise<void> {
    await this.companySelect.click();
    await this.page.getByRole("option", { name: new RegExp(companyName, "i") }).click();
  }

  async fillStatus(status: string): Promise<void> {
    await this.statusSelect.click();
    await this.page.getByRole("option", { name: new RegExp(status, "i") }).click();
  }

  async fillStartDate(date: string): Promise<void> {
    await this.startDateInput.fill(date); // YYYY-MM-DD
  }

  async fillEndDate(date: string): Promise<void> {
    await this.endDateInput.fill(date); // YYYY-MM-DD
  }

  async submit(): Promise<void> {
    await this.submitBtn.click();
  }

  // Assertions
  async assertOnCreatePage(): Promise<void> {
    await expect(this.createSubmitBtn).toBeVisible();
    await expect(this.updateSubmitBtn).not.toBeVisible();
  }

  async assertOnEditPage(): Promise<void> {
    await expect(this.updateSubmitBtn).toBeVisible();
    await expect(this.createSubmitBtn).not.toBeVisible();
  }

  async assertPatientDisabled(): Promise<void> {
    await expect(this.patientSelect).toBeDisabled();
  }

  async assertPlanDisabled(): Promise<void> {
    await expect(this.planSelect).toBeDisabled();
  }

  async assertCompanySelectVisible(): Promise<void> {
    await expect(this.companySelect).toBeVisible();
  }

  async assertStatusSelectVisible(): Promise<void> {
    await expect(this.statusSelect).toBeVisible();
  }

  async assertCompanySelectHidden(): Promise<void> {
    await expect(this.companySelect).not.toBeVisible();
  }

  // Delete confirm modal helpers
  async openDeleteConfirm(confirmText: string): Promise<void> {
    // Trigger delete is done from listing page via cell action
    // This method handles filling the confirm modal
    this.deleteConfirmInput = this.page.getByPlaceholder(/escribe .* para confirmar/i);
    this.deleteConfirmBtn = this.page.getByRole("button", { name: /confirmar/i });
    await this.deleteConfirmInput.fill(confirmText);
  }

  async confirmDelete(): Promise<void> {
    await this.deleteConfirmBtn.click();
  }
}
