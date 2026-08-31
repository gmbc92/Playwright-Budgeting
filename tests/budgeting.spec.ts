import { test, expect } from "@playwright/test";
import { login } from "./helpers/login";
import { BudgetingPage } from "./pages/budgeting.page";

const TEST_FOUNDATION_NAME = "Test foundation for Guilherme";
const STANDARD_TOTAL_BUDGET = "500000";
const STANDARD_CATEGORIES = [
    { name: "New Category 1", value: "0" },
    { name: "New Category 2", value: "0" },
];

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
    test.afterEach(async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);
        await budgetingPage.fillTotalBudget(STANDARD_TOTAL_BUDGET);
    });

    test("accepts a valid budget amount and saves it", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.fillTotalBudget("50000");

        const currentValue = await budgetingPage.getTotalBudgetValue();
        expect(currentValue).toBe("$50,000");
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

        const currentValue = await budgetingPage.getTotalBudgetValue();
        expect(currentValue).toBe("$0");
        await expect(budgetingPage.successToast).toBeVisible();
    });
});

test.describe("Allocation Categories", { tag: "@allocation-categories" }, () => {
    test.afterEach(async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);
        await budgetingPage.resetCategoriesToStandard(STANDARD_CATEGORIES);
    });

    test("edits the name of an existing category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();
        const index = (await budgetingPage.getCategoryCount()) - 1;
        await budgetingPage.fillCategoryName(index, "Marketing");

        const currentName = await budgetingPage.getCategoryName(index);
        expect(currentName).toBe("Marketing");
    });

    test("edits the value of an existing category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();
        const index = (await budgetingPage.getCategoryCount()) - 1;
        await budgetingPage.fillCategoryValue(index, "2500");

        const currentValue = await budgetingPage.getCategoryValue(index);
        expect(currentValue).toBe("2500");
    });

    test("rejects a negative category value", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        await budgetingPage.addCategory();
        const index = (await budgetingPage.getCategoryCount()) - 1;
        await budgetingPage.typeIntoCategoryValue(index, "-500");

        const currentValue = await budgetingPage.getCategoryValue(index);
        expect(currentValue.startsWith("-")).toBe(false);
    });

    test("removes a category when more than one exists", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        const countBefore = await budgetingPage.getCategoryCount();
        await budgetingPage.addCategory();

        const countAfterAdd = await budgetingPage.getCategoryCount();
        expect(countAfterAdd).toBe(countBefore + 1);

        await budgetingPage.removeCategory(countAfterAdd - 1);

        const countAfter = await budgetingPage.getCategoryCount();
        expect(countAfter).toBe(countBefore);
    });

    test("does not remove the last remaining category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);

        let count = await budgetingPage.getCategoryCount();
        while (count > 1) {
            await budgetingPage.removeCategory(0);
            count = await budgetingPage.getCategoryCount();
        }
        expect(count).toBe(1);

        await budgetingPage.removeCategory(0);

        const countAfter = await budgetingPage.getCategoryCount();
        expect(countAfter).toBe(1);
    });

    test("adds a new top-level category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);
        const countBefore = await budgetingPage.getCategoryCount();

        await budgetingPage.addCategory();
        const countAfterAdd = await budgetingPage.getCategoryCount();
        expect(countAfterAdd).toBe(countBefore + 1);

        const newIndex = countAfterAdd - 1;
        await budgetingPage.fillCategoryName(newIndex, "Community Outreach");
        await budgetingPage.fillCategoryValue(newIndex, "1000");

        expect(await budgetingPage.getCategoryName(newIndex)).toBe("Community Outreach");
        expect(await budgetingPage.getCategoryValue(newIndex)).toBe("1000");
    });

    test("removing a parent category also removes its sub-category", async ({ page }) => {
        const budgetingPage = new BudgetingPage(page);
        const countBefore = await budgetingPage.getCategoryCount();

        await budgetingPage.addCategory();
        const countAfterAdd = await budgetingPage.getCategoryCount();
        expect(countAfterAdd).toBe(countBefore + 1);

        const parentIndex = countAfterAdd - 1;
        await budgetingPage.fillCategoryName(parentIndex, "Cascade Parent");
        expect(await budgetingPage.getCategoryName(parentIndex)).toBe("Cascade Parent");

        await budgetingPage.addSubCategory(parentIndex);
        const countWithChild = await budgetingPage.getCategoryCount();
        expect(countWithChild).toBe(countAfterAdd + 1);

        await budgetingPage.removeCategory(parentIndex);
        const countAfterRemoval = await budgetingPage.getCategoryCount();

        expect(countAfterRemoval).toBe(countWithChild - 2);
        expect(countAfterRemoval).toBe(countBefore);
    });
});
