export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export enum BloodType {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export enum PatientStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  DECEASED = "Deceased",
}

export enum DocumentType {
  CC = "CC",
  CE = "CE",
  PASSPORT = "PASSPORT",
  OTHER = "OTHER",
}

export interface Patient {
  id: string;
  user: null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: null | string;
  fullName: string;
}

export interface PatientDetail {
  id: string;
  user: null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  documentType: DocumentType;
  documentNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  secondaryPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: BloodType;
  allergies: string;
  medicalConditions: string;
  companyId?: string;
  patientStatus: PatientStatus;
  medicalRecordNumber: null;
  createdAt: string;
  fullName: string;
  updatedAt: null;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  birthDate?: Date;
  gender: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  secondaryPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  companyId?: string;
}

export interface UpdatePatientDTO {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  secondaryPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  patientStatus?: string;
  medicalRecordNumber?: string;
  companyId?: string;
}

export const GenderLabels = {
  [Gender.MALE]: "Masculino",
  [Gender.FEMALE]: "Femenino",
  [Gender.OTHER]: "Otro",
};

export const BloodTypeLabels = {
  [BloodType.A_POSITIVE]: "A+",
  [BloodType.A_NEGATIVE]: "A-",
  [BloodType.B_POSITIVE]: "B+",
  [BloodType.B_NEGATIVE]: "B-",
  [BloodType.AB_POSITIVE]: "AB+",
  [BloodType.AB_NEGATIVE]: "AB-",
  [BloodType.O_POSITIVE]: "O+",
  [BloodType.O_NEGATIVE]: "O-",
};

export const PatientStatusLabels = {
  [PatientStatus.ACTIVE]: "Activo",
  [PatientStatus.INACTIVE]: "Inactivo",
  [PatientStatus.DECEASED]: "Fallecido",
};

export const DocumentTypeLabels = {
  [DocumentType.CC]: "Cédula de ciudadanía",
  [DocumentType.CE]: "Cédula de extranjería",
  [DocumentType.PASSPORT]: "Pasaporte",
  [DocumentType.OTHER]: "Otro",
};
