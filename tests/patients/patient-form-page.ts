import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "../base-page";

export interface PatientFormData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender: string;
  bloodType?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyId?: string;
}

export class PatientFormPage extends BasePage {
  readonly pageTitle: Locator;
  readonly personalTab: Locator;
  readonly medicalTab: Locator;
  readonly contactTab: Locator;
  readonly emergencyTab: Locator;
  readonly addressTab: Locator;
  readonly companyTab: Locator;

  // Personal tab fields
  readonly documentTypeSelect: Locator;
  readonly documentNumberInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly birthDateInput: Locator;
  readonly genderSelect: Locator;

  // Medical tab fields
  readonly bloodTypeSelect: Locator;
  readonly allergiesTextarea: Locator;
  readonly medicalConditionsTextarea: Locator;

  // Contact tab fields
  readonly phoneInput: Locator;
  readonly secondaryPhoneInput: Locator;

  // Emergency tab fields
  readonly emergencyContactNameInput: Locator;
  readonly emergencyContactPhoneInput: Locator;

  // Address tab fields
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;

  // Company tab fields
  readonly companySelect: Locator;

  // Tab buttons
  readonly saveAndContinueBtn: Locator;
  readonly finishBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole("heading", { name: /paciente/i }).first();

    // Tabs
    this.personalTab = page.getByRole("tab", { name: /datos personales/i });
    this.medicalTab = page.getByRole("tab", { name: /información médica/i });
    this.contactTab = page.getByRole("tab", { name: /datos de contacto/i });
    this.emergencyTab = page.getByRole("tab", { name: /contacto de emergencia/i });
    this.addressTab = page.getByRole("tab", { name: /dirección/i });
    this.companyTab = page.getByRole("tab", { name: /empresa/i });

    // Personal fields
    this.documentTypeSelect = page.getByLabel("Tipo de documento");
    this.documentNumberInput = page.getByLabel("Número de documento");
    this.firstNameInput = page.getByLabel("Nombre");
    this.lastNameInput = page.getByLabel("Apellido");
    this.birthDateInput = page.getByLabel("Fecha de nacimiento");
    this.genderSelect = page.getByLabel("Género");

    // Medical fields
    this.bloodTypeSelect = page.getByLabel("Tipo de sangre");
    this.allergiesTextarea = page.getByLabel("Alergias");
    this.medicalConditionsTextarea = page.getByLabel("Condiciones médicas");

    // Contact fields
    this.phoneInput = page.getByLabel("Teléfono principal");
    this.secondaryPhoneInput = page.getByLabel("Teléfono secundario");

    // Emergency fields
    this.emergencyContactNameInput = page.getByLabel("Nombre del contacto de emergencia");
    this.emergencyContactPhoneInput = page.getByLabel("Teléfono del contacto de emergencia");

    // Address fields
    this.addressInput = page.getByRole("textbox", { name: /^Dirección(\s*\*)?$/ });
    this.cityInput = page.getByLabel("Ciudad");
    this.stateInput = page.getByLabel("Departamento / Estado");
    this.zipCodeInput = page.getByLabel("Código postal");

    // Company field
    this.companySelect = page.getByLabel("Empresa");

    // Buttons
    this.saveAndContinueBtn = page.getByRole("button", { name: /guardar y continuar/i });
    this.finishBtn = page.getByRole("button", { name: /finalizar y volver/i });
  }

  async fillPersonalTab(data: PatientFormData): Promise<void> {
    if (data.documentType) await this.selectOption(this.documentTypeSelect, data.documentType);
    if (data.documentNumber) await this.documentNumberInput.fill(data.documentNumber);
    if (data.firstName) await this.firstNameInput.fill(data.firstName);
    if (data.lastName) await this.lastNameInput.fill(data.lastName);
    if (data.gender) await this.selectOption(this.genderSelect, data.gender);
  }

  async fillMedicalTab(data: PatientFormData): Promise<void> {
    await this.medicalTab.click();
    if (data.bloodType) await this.selectOption(this.bloodTypeSelect, data.bloodType);
    if (data.allergiesTextarea) await this.allergiesTextarea.fill(data.allergiesTextarea);
    if (data.medicalConditionsTextarea) await this.medicalConditionsTextarea.fill(data.medicalConditionsTextarea);
  }

  async fillContactTab(data: PatientFormData): Promise<void> {
    await this.contactTab.click();
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.secondaryPhone) await this.secondaryPhoneInput.fill(data.secondaryPhone);
  }

  async fillEmergencyTab(data: PatientFormData): Promise<void> {
    await this.emergencyTab.click();
    if (data.emergencyContactName) await this.emergencyContactNameInput.fill(data.emergencyContactName);
    if (data.emergencyContactPhone) await this.emergencyContactPhoneInput.fill(data.emergencyContactPhone);
  }

  async fillAddressTab(data: PatientFormData): Promise<void> {
    await this.addressTab.click();
    if (data.address) await this.addressInput.fill(data.address);
    if (data.city) await this.cityInput.fill(data.city);
    if (data.state) await this.stateInput.fill(data.state);
    if (data.zipCode) await this.zipCodeInput.fill(data.zipCode);
  }

  async fillCompanyTab(data: PatientFormData): Promise<void> {
    await this.companyTab.click();
    if (data.companyId) await this.selectOption(this.companySelect, data.companyId);
  }

  // Helper for Radix Select combobox (not native <select>)
  private async selectOption(combobox: Locator, value: string): Promise<void> {
    await combobox.click();
    await this.page.waitForTimeout(500);
    // Radix SelectItem is a button[role="option"] with value and text
    // Use getByRole to find the option by its displayed text (label)
    const itemLabel = this.getSelectItemLabel(value);
    const escapedLabel = itemLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await this.page.getByRole("option", { name: new RegExp(`^${escapedLabel}$`, "i") }).click();
    await this.page.waitForTimeout(300);
  }

  // Map value to label text for common select fields
  private getSelectItemLabel(value: string): string {
    const map: Record<string, string> = {
      CC: "Cédula de ciudadanía",
      CE: "Cédula de extranjería",
      TI: "Tarjeta de identidad",
      PP: "Pasaporte",
      NIT: "NIT",
      MALE: "Masculino",
      FEMALE: "Femenino",
      OTHER: "Otro",
      Male: "Masculino",
      Female: "Femenino",
      Other: "Otro",
      "A+": "A+",
      "A-": "A-",
      "B+": "B+",
      "B-": "B-",
      "AB+": "AB+",
      "AB-": "AB-",
      "O+": "O+",
      "O-": "O-",
    };
    return map[value] ?? value;
  }

  async savePersonalTab(): Promise<void> {
    await this.saveAndContinueBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async finishForm(): Promise<void> {
    await this.companyTab.click();
    await this.finishBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async expectSuccessNotification(): Promise<void> {
    await this.waitForToast();
    const toast = this.page.locator("[data-sonner-toast], [role='alert']").first();
    await expect(toast).toBeVisible();
  }

  async expectToBeOnPatientsList(): Promise<void> {
    await expect(this.page).toHaveURL(/\/pacientes/);
  }

  async expectValidationError(field: string): Promise<void> {
    const error = this.page.getByText(/requerido|inválido/i);
    await expect(error.first()).toBeVisible();
  }
}
