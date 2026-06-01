import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const apiURL = process.env.E2E_API_URL ?? "http://localhost:3000";
const _configDir = path.dirname(fileURLToPath(import.meta.url));
const storageStatePath = path.join(_configDir, "tests/.auth/admin-state.json");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report" }]],

  globalSetup: path.join(_configDir, "tests/global-setup.ts"),

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Project for tests that need a clean (unauthenticated) session
    // Used ONLY for login form tests (tests/auth/login.spec.ts)
    {
      name: "chromium-clean",
      testMatch: /.*auth\/login\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // No storageState - fresh session for each test
      },
    },
    // Project for tests that need authentication (all other e2e tests)
    {
      name: "chromium",
      testIgnore: [/.*auth\/login\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        // Reuse authenticated session for all tests — no per-module login needed
        storageState: storageStatePath,
      },
    },
  ],

  webServer: [
    {
      command: "pnpm dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: apiURL,
      },
    },
  ],
});
