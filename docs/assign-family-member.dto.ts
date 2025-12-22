import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class AssignFamilyMemberDto {
  /**
   * The ID of the main subscription (the family plan owner's subscription)
   */
  @IsUUID()
  @IsString()
  subscriptionId: string;

  /**
   * The ID of the patient to add as a family member
   */
  @IsUUID()
  @IsString()
  familyMemberPatientId: string;

  /**
   * Optional start date for the family member's coverage.
   * Defaults to the current date if not provided.
   */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /**
   * Optional end date for the family member's coverage.
   * Defaults to the main subscription's end date if not provided.
   */
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
