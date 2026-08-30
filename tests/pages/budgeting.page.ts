import { Page, Locator, expect } from "@playwright/test";

export class BudgetingPage {
    readonly page: Page;
    readonly budgetingHeading: Locator;
    readonly startOfBudgetYearGroup: Locator;
    readonly totalBudgetInput: Locator;
    readonly allocationCategoriesText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.budgetingHeading = page.getByText("Budgeting", { exact: true });
        this.startOfBudgetYearGroup = page.getByLabel("Start Of Budget Year");
        this.totalBudgetInput = page.getByLabel("Total budget year grant budget (Planned Giving)");
        this.allocationCategoriesText = page.getByText("Allocation categories", { exact: true });
    }

    async openFoundation(foundationName: string) {
        await this.page.getByRole("link", { name: foundationName, exact: true }).click();
    }

    async goToAdminSettings() {
        await this.page.getByRole("button", { name: "More", exact: true }).click();
        await this.page.getByRole("menuitem", { name: "User Settings" }).click();
        await this.page.getByRole("link", { name: "Admin", exact: true }).click();
    }

    async assertBudgetingArea() {
        await this.page.waitForURL((url) => url.pathname.includes("/settings/admin"));
        await expect(this.budgetingHeading).toBeVisible();
        await expect(this.allocationCategoriesText).toBeVisible();
        await expect(this.totalBudgetInput).toBeVisible();
    }
}
