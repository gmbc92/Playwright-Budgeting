import { test, expect } from "@playwright/test";
import { login } from "./helpers/login";
import { BudgetingPage } from "./pages/budgeting.page";

test.beforeEach(async ({ page }) => {
    await login(page);
});

test("navigates to the Budgeting section under Admin settings", async ({ page }) => {
    const budgetingPage = new BudgetingPage(page);

    await budgetingPage.openFoundation("Test foundation for Guilherme");
    await budgetingPage.goToAdminSettings();

    await budgetingPage.assertBudgetingArea();
});
