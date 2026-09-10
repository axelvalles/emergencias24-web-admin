import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.policy\.spec\.ts/,
  workers: 1,
});
