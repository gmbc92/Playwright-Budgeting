import { test, expect } from "@playwright/test";
import { login } from "./helpers/login";
import { BudgetingPage } from "./pages/budgeting.page";

const TEST_FOUNDATION_NAME = "Test foundation for Guilherme";

test.beforeEach(async ({ page }) => {
    const budgetingPage = new BudgetingPage(page);

    await login(page);
    await budgetingPage.openFoundation(TEST_FOUNDATION_NAME);
    await budgetingPage.goToAdminSettings();
    await budgetingPage.assertBudgetingArea();
});

test.describe("Budgeting navigation", { tag: "@navigation" }, () => {
    test("navigates to the Budgeting section under Admin settings", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await expect(budgetingPage.budgetingHeading).toBeVisible();
        await expect(budgetingPage.totalBudgetInput).toBeVisible();
        await expect(budgetingPage.allocationCategoriesText).toBeVisible();
    });
});

test.describe.configure({ mode: "serial" });

test.describe("Total Budget", { tag: "@total-budget" }, () => {
    test("accepts a valid budget amount and saves it", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.fillTotalBudget("50000");

        await expect(budgetingPage.successToast).toBeVisible();
    });

    test("rejects a negative budget amount", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.typeIntoTotalBudget("-500");

        const currentValue = await budgetingPage.getTotalBudgetValue();
        expect(currentValue.startsWith("-")).toBe(false);
    });

    test("ignores non-numeric characters", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.typeIntoTotalBudget("abc");

        const currentValue = await budgetingPage.getTotalBudgetValue();
        expect(currentValue.toLowerCase().includes("a")).toBe(false);
    });

    test("accepts zero as a valid budget amount", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.fillTotalBudget("0");

        await expect(budgetingPage.successToast).toBeVisible();
    });
});
