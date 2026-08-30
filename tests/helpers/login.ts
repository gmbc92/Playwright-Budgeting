import { Page } from "@playwright/test";

export async function login(page: Page) {
    await page.goto("/signin");
    await page.locator('input[name="email"]').fill(process.env.TEMELIO_USER!);
    await page.locator('input[name="password"]').fill(process.env.TEMELIO_PASSWORD!);
    await page.locator('button[type="submit"]', { hasText: "Sign In" }).click();
    await page.getByText("Foundations", { exact: true }).waitFor({ timeout: 30000 });
}

// await page.getByRole("textbox", { name: "Email"}).fill(process.env.TEMELIO_USER!);
// await page.getByRole("textbox", { name: "Password"}).fill(process.env.TEMELIO_USER!);
// await page.getByRole("button", { name: "Sign In"}).click();
