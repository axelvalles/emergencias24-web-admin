import { expect, test } from "@playwright/test";

import { navItems } from "~/components/layout/nav-items";
import { canAccessPath, canAccessRole } from "~/lib/access-control";
import { UserRole } from "~/types/users";

test.describe("dispatcher admin policy", () => {
  test("shows only ticket, patient, and subscription business modules", () => {
    const visibleModules = navItems
      .filter(
        (item) =>
          item.url !== "/" &&
          canAccessRole(UserRole.DISPATCHER, item.allowedRoles),
      )
      .map((item) => item.url);

    expect(visibleModules).toEqual([
      "/pacientes",
      "/suscripciones",
      "/tickets",
    ]);
  });

  test("allows dispatcher list routes but denies mutation and management routes", () => {
    expect(canAccessPath(UserRole.DISPATCHER, "/pacientes")).toBe(true);
    expect(canAccessPath(UserRole.DISPATCHER, "/suscripciones")).toBe(true);
    expect(canAccessPath(UserRole.DISPATCHER, "/tickets/1234")).toBe(true);

    expect(canAccessPath(UserRole.DISPATCHER, "/pacientes/nuevo")).toBe(false);
    expect(
      canAccessPath(UserRole.DISPATCHER, "/pacientes/editar/1234"),
    ).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/suscripciones/nueva")).toBe(
      false,
    );
    expect(
      canAccessPath(UserRole.DISPATCHER, "/suscripciones/editar/1234"),
    ).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/planes")).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/beneficios")).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/empresas")).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/usuarios")).toBe(false);
    expect(canAccessPath(UserRole.DISPATCHER, "/unidades-ambulancia")).toBe(
      false,
    );
    expect(canAccessPath(UserRole.DISPATCHER, "/ruta-no-clasificada")).toBe(
      false,
    );
  });

  test("preserves administrative routes for admin and super-admin", () => {
    for (const role of [UserRole.ADMIN, UserRole.SUPER_ADMIN]) {
      expect(canAccessPath(role, "/pacientes/nuevo")).toBe(true);
      expect(canAccessPath(role, "/suscripciones/editar/1234")).toBe(true);
      expect(canAccessPath(role, "/planes")).toBe(true);
      expect(canAccessPath(role, "/unidades-ambulancia")).toBe(true);
    }
  });
});
