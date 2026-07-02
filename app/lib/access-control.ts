import { UserRole } from "~/types/users";

const ROLE_HIERARCHY: Record<UserRole, readonly UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DISPATCHER,
    UserRole.PARAMEDIC,
    UserRole.DOCTOR,
    UserRole.APPOINTMENT_MANAGER,
    UserRole.MARKETING,
  ],
  [UserRole.ADMIN]: [
    UserRole.ADMIN,
    UserRole.DISPATCHER,
    UserRole.PARAMEDIC,
    UserRole.DOCTOR,
    UserRole.APPOINTMENT_MANAGER,
    UserRole.MARKETING,
  ],
  [UserRole.DISPATCHER]: [UserRole.DISPATCHER],
  [UserRole.PARAMEDIC]: [UserRole.PARAMEDIC],
  [UserRole.DOCTOR]: [UserRole.DOCTOR],
  [UserRole.APPOINTMENT_MANAGER]: [UserRole.APPOINTMENT_MANAGER],
  [UserRole.MARKETING]: [UserRole.MARKETING],
};

export function canAccessRole(
  userRole: UserRole | null | undefined,
  allowedRoles?: readonly UserRole[],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  return allowedRoles.some((allowedRole) =>
    ROLE_HIERARCHY[userRole].includes(allowedRole),
  );
}
