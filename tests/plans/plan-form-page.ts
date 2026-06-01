import { type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export class PlanFormPage extends BasePage {
  // Form fields — initialized in constructor
  nameInput!: Locator;
  planTypeSelect!: Locator;
  monthlyCostInput!: Locator;
  descriptionTextarea!: Locator;

  // Benefit switches — initialized in constructor
  telemedicineSwitch!: Locator;
  medicationDeliverySwitch!: Locator;
  ambulanceTransferSwitch!: Locator;
  homeCareSwitch!: Locator;
  workplaceCareSwitch!: Locator;
  emergencyRoomSwitch!: Locator;
  specializedConsultationsSwitch!: Locator;
  labTestsSwitch!: Locator;
  benefitsNotesTextarea!: Locator;

  // Benefit bulk actions
  activateAllBtn!: Locator;
  clearAllBtn!: Locator;

  // Benefit count
  benefitsCount!: Locator;

  // Submit buttons
  submitBtn!: Locator;
  createSubmitBtn!: Locator;
  updateSubmitBtn!: Locator;

  // Subscription warning
  subscriptionWarning!: Locator;

  constructor(page: import("@playwright/test").Page) {
    super(page);
    this.initLocators();
  }

  private initLocators() {
    this.nameInput = this.page.getByLabel(/nombre del plan/i);
    this.planTypeSelect = this.page.getByLabel(/tipo de plan/i);
    this.monthlyCostInput = this.page.getByLabel(/costo mensual/i);
    this.descriptionTextarea = this.page.locator("textarea[name='description']");

    this.telemedicineSwitch = this.switchFor("telemedicina");
    this.medicationDeliverySwitch = this.switchFor("entrega de medicamentos");
    this.ambulanceTransferSwitch = this.switchFor("traslado en ambulancia");
    this.homeCareSwitch = this.switchFor("cuidado en casa");
    this.workplaceCareSwitch = this.switchFor("cuidado en el trabajo");
    this.emergencyRoomSwitch = this.switchFor("sala de emergencias");
    this.specializedConsultationsSwitch = this.switchFor("consultas especializadas");
    this.labTestsSwitch = this.switchFor("pruebas de laboratorio");
    this.benefitsNotesTextarea = this.page.getByLabel(/notas de beneficios/i);

    this.activateAllBtn = this.page.getByRole("button", { name: /activar todos/i });
    this.clearAllBtn = this.page.getByRole("button", { name: /limpiar todos/i });
    this.benefitsCount = this.page.locator("text=/\\d+ de \\d+ beneficios activos/i");

    this.submitBtn = this.page.getByRole("button", { name: /(crear|actualizar) plan/i });
    this.createSubmitBtn = this.page.getByRole("button", { name: /crear plan/i });
    this.updateSubmitBtn = this.page.getByRole("button", { name: /actualizar plan/i });

    this.subscriptionWarning = this.page.locator("text=/suscripciones activas/i");
  }

  private switchFor(label: string): Locator {
    return this.page
      .locator("label", { hasText: new RegExp(label, "i") })
      .locator("xpath=ancestor::div[contains(@class,'items-center')][1]//button[@role='switch']");
  }

  // Navigation
  async gotoCreate(): Promise<void> {
    await this.page.goto("/planes/nuevo");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoEdit(planId: string): Promise<void> {
    await this.page.goto(`/planes/editar/${planId}`);
    await this.page.waitForLoadState("networkidle");
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillPlanType(type: "FAMILY" | "CORPORATE" | "GROUP"): Promise<void> {
    await this.planTypeSelect.click();
    await this.page.getByRole("option", { name: this.planTypeLabel(type) }).click();
  }

  async fillMonthlyCost(cost: string): Promise<void> {
    await this.monthlyCostInput.fill(cost);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionTextarea.fill(description);
  }

  async toggleBenefit(switchLocator: Locator): Promise<void> {
    await switchLocator.click();
  }

  async enableAllBenefits(): Promise<void> {
    await this.activateAllBtn.click();
  }

  async clearAllBenefits(): Promise<void> {
    await this.clearAllBtn.click();
  }

  async fillForm(data: {
    name: string;
    planType: "FAMILY" | "CORPORATE" | "GROUP";
    monthlyCost?: string;
    description?: string;
    benefits?: Record<string, boolean>;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.fillPlanType(data.planType);
    if (data.monthlyCost !== undefined) {
      await this.fillMonthlyCost(data.monthlyCost);
    }
    if (data.description !== undefined) {
      await this.fillDescription(data.description);
    }
    if (data.benefits !== undefined) {
      await this.clearAllBenefits();
      const switchMap: Record<string, Locator> = {
        telemedicine: this.telemedicineSwitch,
        medicationDelivery: this.medicationDeliverySwitch,
        ambulanceTransfer: this.ambulanceTransferSwitch,
        homeCare: this.homeCareSwitch,
        workplaceCare: this.workplaceCareSwitch,
        emergencyRoom: this.emergencyRoomSwitch,
        specializedConsultations: this.specializedConsultationsSwitch,
        labTests: this.labTestsSwitch,
      };
      for (const [key, value] of Object.entries(data.benefits)) {
        if (value === true) {
          const locator = switchMap[key];
          if (locator) {
            await this.toggleBenefit(locator);
          }
        }
      }
    }
  }

  async submit(): Promise<void> {
    await this.submitBtn.click();
  }

  async assertOnCreatePage(): Promise<void> {
    await expect(this.createSubmitBtn).toBeVisible();
    await expect(this.updateSubmitBtn).not.toBeVisible();
  }

  async assertOnEditPage(): Promise<void> {
    await expect(this.updateSubmitBtn).toBeVisible();
    await expect(this.createSubmitBtn).not.toBeVisible();
  }

  async assertNameRequired(): Promise<void> {
    await expect(this.page.locator("text=El nombre debe tener al menos 3 caracteres")).toBeVisible();
  }

  async assertMonthlyCostInvalid(): Promise<void> {
    await expect(this.page.getByText(/Debe ser un n[uú]mero decimal v[aá]lido/i)).toBeVisible();
  }

  async assertBenefitsCount(count: number): Promise<void> {
    await expect(this.page.locator(`text=/^${count} de 8 beneficios activos$/`)).toBeVisible();
  }

  private planTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      FAMILY: "Familiar",
      CORPORATE: "Corporativo",
      GROUP: "Grupal",
    };
    return labels[type] ?? type;
  }
}
