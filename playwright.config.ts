import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    timeout: 120_000,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "https://app-dev.trytemelio.com",
        locale: "en-US",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        actionTimeout: 30000,
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },

        // {
        //     name: "firefox",
        //     use: { ...devices["Desktop Firefox"] },
        // },

        // {
        //     name: "webkit",
        //     use: { ...devices["Desktop Safari"] },
        // },
    ],
});
