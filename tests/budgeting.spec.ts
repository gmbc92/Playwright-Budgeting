import { test, expect } from "@playwright/test";
import { login } from "./helpers/login";
import { BudgetingPage } from "./pages/budgeting.page";

const TEST_FOUNDATION_NAME = "Test foundation for Guilherme";
const STANDARD_TOTAL_BUDGET = "500000";

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
        expect(await budgetingPage.getTotalBudgetValue()).toBe("$50,000");

        await budgetingPage.fillTotalBudget(STANDARD_TOTAL_BUDGET);
    });

    test("rejects a negative budget amount", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.typeIntoTotalBudget("-500");
        expect((await budgetingPage.getTotalBudgetValue()).startsWith("-")).toBe(false);

        await budgetingPage.fillTotalBudget(STANDARD_TOTAL_BUDGET);
    });

    test("ignores non-numeric characters", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.typeIntoTotalBudget("abc");
        expect((await budgetingPage.getTotalBudgetValue()).toLowerCase().includes("a")).toBe(false);

        await budgetingPage.fillTotalBudget(STANDARD_TOTAL_BUDGET);
    });

    test("accepts zero as a valid budget amount", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.fillTotalBudget("0");
        expect(await budgetingPage.getTotalBudgetValue()).toBe("$0");

        await budgetingPage.fillTotalBudget(STANDARD_TOTAL_BUDGET);
    });
});

test.describe("Allocation Categories", { tag: "@allocation-categories" }, () => {
    test("adds, edits and removes an allocation category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();

        await budgetingPage.fillLastCategoryName("Marketing");
        expect(await budgetingPage.lastCategoryName().inputValue()).toBe("Marketing");

        await budgetingPage.fillLastCategoryValue("2500");
        expect(await budgetingPage.lastCategoryValue().inputValue()).toBe("2500");

        await budgetingPage.removeLastCategory();
        await expect(page.getByText("Marketing")).toHaveCount(0);
    });

    test("rejects a negative category value", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();
        await budgetingPage.fillLastCategoryValue("-500");

        expect((await budgetingPage.lastCategoryValue().inputValue()).startsWith("-")).toBe(false);

        await budgetingPage.removeLastCategory();
    });

    test("rejects a child allocation that exceeds its parent's amount", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();
        await budgetingPage.fillLastCategoryName("Budget Parent");
        await budgetingPage.fillLastCategoryValue("1000");

        await budgetingPage.addSubCategory();
        await budgetingPage.fillLastCategoryValue("1500");

        await expect(budgetingPage.childExceedsParentWarning).toBeVisible();
        await expect(budgetingPage.categoryExceedsParentError()).toBeVisible();

        await budgetingPage.fillLastCategoryValue("500");
        await expect(budgetingPage.childExceedsParentWarning).not.toBeVisible();

        await budgetingPage.removeLastCategory();
    });
});
