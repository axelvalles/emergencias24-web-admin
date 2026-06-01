/**
 * Global setup — runs once before all tests.
 * Logs in as admin and saves the auth state to a file.
 * All tests then reuse this state via storageState in playwright.config.ts.
 *
 * IMPORTANT: Backend and frontend are started by Playwright webServer config.
 */
import { chromium, type FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const _setupDir = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE_PATH = path.join(_setupDir, ".auth/admin-state.json");

function loadE2EEnv(): void {
  const webAdminDir = path.resolve(_setupDir, "..");
  const backendDir = path.resolve(webAdminDir, "../backend");

  const envFiles = [
    path.join(webAdminDir, ".env"),
    path.join(webAdminDir, ".env.local"),
    path.join(backendDir, ".env"),
    path.join(backendDir, ".env.local"),
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
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
}

async function globalSetup(config: FullConfig) {
  loadE2EEnv();

  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? process.env.SUPERUSER_EMAIL;
  const adminPassword =
    process.env.E2E_ADMIN_PASSWORD ?? process.env.SUPERUSER_PASSWORD;
  const apiBaseUrl = process.env.E2E_API_URL ?? "http://localhost:3000";

  console.log(
    `[globalSetup] credentials loaded: email=${adminEmail ? "yes" : "no"}, password=${adminPassword ? "yes" : "no"}`,
  );

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "[globalSetup] Missing admin credentials. Set E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD or SUPERUSER_EMAIL/SUPERUSER_PASSWORD.",
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Ensure the .auth directory exists
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Check if backend API is reachable
  try {
    const response = await page.request.get(`${apiBaseUrl}/auth/login`, {
      timeout: 5000,
    });
    // Any response means backend is up (even 404 or 405 is fine - endpoint exists)
    console.log(`[globalSetup] Backend API is reachable at ${apiBaseUrl}`);
  } catch (error) {
    await browser.close();
    throw new Error(
      `[globalSetup] Backend API is not reachable at ${apiBaseUrl}.\n` +
        `Please ensure the backend is running (cd packages/backend && pnpm dev).\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // If storageState already exists, check if it's still valid by going to the app
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    console.log(
      `[globalSetup] Found existing storageState at ${STORAGE_STATE_PATH}`,
    );
    // Just verify it works by navigating to app root
    const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:5173";
    await page.goto(baseURL);
    await page.waitForTimeout(2000);
    const url = page.url();
    if (!url.includes("/login")) {
      console.log(`[globalSetup] Existing storageState is valid (on ${url})`);
      await page.context().storageState({ path: STORAGE_STATE_PATH });
      await browser.close();
      return;
    }
    console.log(
      `[globalSetup] Existing storageState is invalid (still on /login), will re-authenticate`,
    );
  }

  // Authenticate via API to avoid brittle UI-login redirects and throttling.
  const loginResponse = await page.request.post(`${apiBaseUrl}/auth/login`, {
    data: {
      email: adminEmail,
      password: adminPassword,
    },
  });

  if (!loginResponse.ok()) {
    await page.context().storageState({ path: STORAGE_STATE_PATH });
    await browser.close();
    console.warn(
      `[globalSetup] API login failed with status ${loginResponse.status()}. Continuing with empty auth state; tests with explicit login should still pass.`,
    );
    return;
  }

  const loginPayload = await loginResponse.json();

  await page.addInitScript(
    (authStorage) => {
      window.localStorage.setItem("auth-storage", JSON.stringify(authStorage));
    },
    {
      state: {
        user: loginPayload.user,
        token: loginPayload.accessToken,
        isAuthenticated: true,
      },
      version: 0,
    },
  );

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:5173";
  await page.goto(baseURL);

  // Save auth state (cookies + localStorage)
  await page.context().storageState({ path: STORAGE_STATE_PATH });

  await browser.close();
  console.log(`[globalSetup] Auth state saved to ${STORAGE_STATE_PATH}`);
}

export default globalSetup;
