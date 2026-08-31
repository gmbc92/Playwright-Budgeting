import { Page, Locator, expect } from "@playwright/test";

export class BudgetingPage {
    readonly page: Page;
    readonly budgetingHeading: Locator;
    readonly startOfBudgetYearGroup: Locator;
    readonly totalBudgetInput: Locator;
    readonly allocationCategoriesText: Locator;
    readonly successToast: Locator;
    readonly childExceedsParentWarning: Locator;
    readonly loadingBudgetIndicator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.budgetingHeading = page.getByText("Budgeting", { exact: true });
        this.startOfBudgetYearGroup = page.getByLabel("Start Of Budget Year");
        this.totalBudgetInput = page.getByLabel("Total budget year grant budget (Planned Giving)");
        this.allocationCategoriesText = page.getByText("Allocation categories", { exact: true });
        this.successToast = page.getByText("Successfully updated");
        this.childExceedsParentWarning = page.getByText("Some child allocations exceed their parent allocation amounts", {
            exact: false,
        });
        this.loadingBudgetIndicator = page.getByText("Loading budget...");
    }

    private toastCloseButton(): Locator {
        return this.page
            .getByRole("region", { name: "Notifications-bottom", exact: true })
            .getByRole("button", { name: "Close" });
    }

    private async closeToasts() {
        for (let i = 0; i < 3; i++) {
            const count = await this.toastCloseButton()
                .count()
                .catch(() => 0);
            if (count === 0) return;

            await this.toastCloseButton()
                .first()
                .click({ timeout: 2000 })
                .catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    private async clearField(locator: Locator) {
        await locator.click();
        await locator.press("ControlOrMeta+A");
        await locator.press("Backspace");

        let currentValue = await locator.inputValue();
        while (currentValue.length > 0) {
            await locator.press("Backspace");
            currentValue = await locator.inputValue();
        }
    }

    async openFoundation(foundationName: string) {
        await this.page.getByRole("link", { name: foundationName, exact: true }).click();
    }

    async goToAdminSettings() {
        await this.page.getByRole("button", { name: "More", exact: true }).click();
        await this.page.getByRole("menuitem", { name: "User Settings" }).click();
        await this.page.waitForURL((url) => url.pathname.includes("/settings"));
        await this.page.getByRole("link", { name: "Admin", exact: true }).click();
    }

    async assertBudgetingArea() {
        await this.page.waitForURL((url) => url.pathname.includes("/settings/admin"));
        await expect(this.budgetingHeading).toBeVisible();
        await this.loadingBudgetIndicator.waitFor({ state: "hidden" }).catch(() => {});
        await expect(this.allocationCategoriesText).toBeVisible();
        await expect(this.totalBudgetInput).toBeVisible();
    }

    async fillTotalBudget(amount: string) {
        await this.clearField(this.totalBudgetInput);
        await this.totalBudgetInput.fill(amount);
        await this.totalBudgetInput.blur();
        await this.closeToasts();
    }

    async typeIntoTotalBudget(text: string) {
        await this.clearField(this.totalBudgetInput);
        await this.totalBudgetInput.pressSequentially(text);
        await this.totalBudgetInput.blur();
    }

    async getTotalBudgetValue() {
        return this.totalBudgetInput.inputValue();
    }

    lastCategoryName(): Locator {
        return this.page.getByRole("textbox").last();
    }

    lastCategoryValue(): Locator {
        return this.page.getByRole("spinbutton").last();
    }

    categoryExceedsParentError(): Locator {
        return this.page.getByText("Amount cannot exceed parent allocation", { exact: false });
    }

    async addCategory() {
        await this.page.getByRole("button", { name: "Add" }).nth(3).click();
        await this.page.waitForTimeout(10000);
        await this.closeToasts();
    }

    async addSubCategory() {
        await this.page.getByRole("button", { name: "Add sub" }).last().click();
        await this.page.waitForTimeout(10000);
        await this.closeToasts();
    }

    async fillLastCategoryName(name: string) {
        await this.clearField(this.lastCategoryName());
        await this.lastCategoryName().fill(name);
        await this.lastCategoryName().blur();
        await this.closeToasts();
    }

    async fillLastCategoryValue(value: string) {
        await this.clearField(this.lastCategoryValue());
        await this.lastCategoryValue().fill(value);
        await this.lastCategoryValue().blur();
        await this.closeToasts();
    }

    async removeLastCategory() {
        await this.page.getByRole("button", { name: "Remove" }).last().click();
        await this.page.waitForTimeout(5000);
        await this.closeToasts();
    }
}
