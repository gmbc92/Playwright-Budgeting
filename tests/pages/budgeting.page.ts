import { Page, Locator, expect } from "@playwright/test";

export class BudgetingPage {
    readonly page: Page;
    readonly budgetingHeading: Locator;
    readonly startOfBudgetYearGroup: Locator;
    readonly totalBudgetInput: Locator;
    readonly allocationCategoriesText: Locator;
    readonly successToast: Locator;

    constructor(page: Page) {
        this.page = page;
        this.budgetingHeading = page.getByText("Budgeting", { exact: true });
        this.startOfBudgetYearGroup = page.getByLabel("Start Of Budget Year");
        this.totalBudgetInput = page.getByLabel("Total budget year grant budget (Planned Giving)");
        this.allocationCategoriesText = page.getByText("Allocation categories", { exact: true });
        this.successToast = page.getByText("Successfully updated");
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
        await expect(this.allocationCategoriesText).toBeVisible();
        await expect(this.totalBudgetInput).toBeVisible();
    }

    async fillTotalBudget(amount: string) {
        await this.clearField(this.totalBudgetInput);
        await this.totalBudgetInput.fill(amount);
        await this.totalBudgetInput.blur();
    }

    async typeIntoTotalBudget(text: string) {
        await this.clearField(this.totalBudgetInput);
        await this.totalBudgetInput.pressSequentially(text);
        await this.totalBudgetInput.blur();
    }

    async getTotalBudgetValue() {
        return this.totalBudgetInput.inputValue();
    }

    categoryNameInput(index: number): Locator {
        return this.page.getByRole("textbox").nth(index + 1);
    }

    categoryValueInput(index: number): Locator {
        return this.page.getByRole("spinbutton").nth(index);
    }

    removeCategoryButton(index: number): Locator {
        return this.page.getByRole("button", { name: "Remove" }).nth(index);
    }

    async fillCategoryName(index: number, name: string) {
        const input = this.categoryNameInput(index);
        await this.clearField(input);
        await input.fill(name);
        await input.blur();
    }

    async getCategoryName(index: number) {
        return this.categoryNameInput(index).inputValue();
    }

    async fillCategoryValue(index: number, value: string) {
        const input = this.categoryValueInput(index);
        await this.clearField(input);
        await input.fill(value);
        await input.blur();
    }

    async typeIntoCategoryValue(index: number, text: string) {
        const input = this.categoryValueInput(index);
        await this.clearField(input);
        await input.pressSequentially(text);
        await input.blur();
    }

    async getCategoryValue(index: number) {
        return this.categoryValueInput(index).inputValue();
    }

    async removeCategory(index: number) {
        await this.removeCategoryButton(index).click();
    }

    async getCategoryCount() {
        return this.page.getByRole("spinbutton").count();
    }

    async addCategory() {
        await this.page.getByRole("button", { name: "Add" }).nth(3).click();
    }

    async addSubCategory(parentIndex: number) {
        await this.page.getByRole("button", { name: "Add sub" }).nth(parentIndex).click();
    }

    async resetCategoriesToStandard(standard: { name: string; value: string }[]) {
        let count = await this.getCategoryCount();
        while (count > 1) {
            await this.removeCategory(0);
            count = await this.getCategoryCount();
        }

        await this.fillCategoryName(0, standard[0].name);
        await this.fillCategoryValue(0, standard[0].value);

        for (let i = 1; i < standard.length; i++) {
            await this.addCategory();
            const index = (await this.getCategoryCount()) - 1;
            await this.fillCategoryName(index, standard[i].name);
            await this.fillCategoryValue(index, standard[i].value);
        }
    }
}
