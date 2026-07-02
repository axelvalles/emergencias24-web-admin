import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const helpersDir = path.dirname(fileURLToPath(import.meta.url));

function loadTestEnv(): void {
  const testsDir = helpersDir;
  const webAdminDir = path.resolve(testsDir, "..");
  const backendDirCandidates = [
    path.resolve(webAdminDir, "../emergencias24-backend"),
    path.resolve(webAdminDir, "../backend"),
  ];

  const envFiles = [
    path.join(webAdminDir, ".env"),
    path.join(webAdminDir, ".env.local"),
    ...backendDirCandidates.flatMap((backendDir) => [
      path.join(backendDir, ".env"),
      path.join(backendDir, ".env.local"),
    ]),
  ];

  for (const envPath of envFiles) {
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (!(key in process.env)) {
        process.env[key] = value.replace(/^['\"]|['\"]$/g, "");
      }
    }
  }
}

loadTestEnv();

/**
 * Test data generation utilities for E2E tests.
 * All data is generated fresh per test to avoid cross-test pollution.
 */

export function generateUniqueEmail(): string {
  return `e2e.test.${Date.now()}.${Math.random().toString(36).slice(2)}@test.com`;
}

export function generateTestUser(
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }> = {},
): {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
} {
  const suffix = Math.random().toString(36).slice(2, 6);
  return {
    firstName: `Test${suffix}`,
    lastName: `User${suffix}`,
    email: generateUniqueEmail(),
    password: `TestPass123!`,
    phone: `+54${Math.floor(9000000000 + Math.random() * 999999999)}`,
    ...overrides,
  };
}

export function generateTestCompany(
  overrides: Partial<{
    name: string;
    taxId: string;
    contactEmail: string;
    contactPhone: string;
  }> = {},
): {
  name: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
} {
  const suffix = Math.random().toString(36).slice(2, 6);
  return {
    name: `Empresa Test ${suffix}`,
    taxId: `${Math.floor(20000000000 + Math.random() * 99999999999)}`,
    contactEmail: generateUniqueEmail(),
    contactPhone: `+54${Math.floor(9000000000 + Math.random() * 999999999)}`,
    ...overrides,
  };
}

export function generateTestPlan(
  overrides: Partial<{
    name: string;
    description: string;
    monthlyCost: number;
  }> = {},
): {
  name: string;
  description: string;
  monthlyCost: number;
} {
  const suffix = Math.random().toString(36).slice(2, 6);
  return {
    name: `Plan Test ${suffix}`,
    description: `Descripción del plan de prueba ${suffix}`,
    monthlyCost: Math.floor(1000 + Math.random() * 9000),
    ...overrides,
  };
}

export function generateTestPatient(
  overrides: Partial<{
    firstName: string;
    lastName: string;
    documentNumber: string;
    email: string;
    phone: string;
  }> = {},
): {
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
} {
  const suffix = Math.random().toString(36).slice(2, 6);
  return {
    firstName: `Paciente${suffix}`,
    lastName: `Test${suffix}`,
    documentNumber: `${Math.floor(10000000 + Math.random() * 99999999)}`,
    email: generateUniqueEmail(),
    phone: `+54${Math.floor(9000000000 + Math.random() * 999999999)}`,
    ...overrides,
  };
}

/**
 * Default admin credentials for E2E tests.
 * Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD env vars to override.
 * Default values match packages/backend/.env SUPERUSER credentials.
 */
export const DEFAULT_ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? process.env.SUPERUSER_EMAIL,
  password: process.env.E2E_ADMIN_PASSWORD ?? process.env.SUPERUSER_PASSWORD,
};
