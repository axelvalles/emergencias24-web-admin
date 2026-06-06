export interface MunicipalityPricing {
  id: string;
  municipality: string;
  displayOrder: number;
  homeCarePrice: string;
  ambulancePrice: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateMunicipalityPricingDTO {
  homeCarePrice?: number;
  ambulancePrice?: number;
}
