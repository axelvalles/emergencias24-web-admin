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

const ROUTE_ROLE_RULES: Array<{
  prefix: string;
  allowedRoles: readonly UserRole[];
}> = [
  { prefix: "/pacientes/nuevo", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/pacientes/editar", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/suscripciones/nueva", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/suscripciones/editar", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/usuarios", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/unidades-ambulancia", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/costos-municipio", allowedRoles: [UserRole.SUPER_ADMIN] },
  {
    prefix: "/tickets",
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.DISPATCHER,
      UserRole.DOCTOR,
      UserRole.APPOINTMENT_MANAGER,
      UserRole.MARKETING,
      UserRole.PARAMEDIC,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    prefix: "/pacientes",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  {
    prefix: "/suscripciones",
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
  },
  { prefix: "/planes", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/beneficios", allowedRoles: [UserRole.ADMIN] },
  { prefix: "/empresas", allowedRoles: [UserRole.ADMIN] },
];

const matchesPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function getAllowedRolesForPath(pathname: string) {
  const matchedRule = ROUTE_ROLE_RULES.find((rule) =>
    matchesPathPrefix(pathname, rule.prefix),
  );

  if (matchedRule) {
    return matchedRule.allowedRoles;
  }

  return pathname === "/" ? undefined : [UserRole.ADMIN];
}

export function canAccessPath(
  userRole: UserRole | null | undefined,
  pathname: string,
) {
  if (!userRole) {
    return false;
  }

  return canAccessRole(userRole, getAllowedRolesForPath(pathname));
}
