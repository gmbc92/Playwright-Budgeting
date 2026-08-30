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

    async fillTotalBudget(amount: string) {
        await this.totalBudgetInput.fill(amount);
        await this.totalBudgetInput.blur(); // precisa tirar o foco pra disparar o autosave
    }

    async typeIntoTotalBudget(text: string) {
        // pressSequentially em vez de fill: simula teclado de verdade,
        // testando se a máscara do campo bloqueia caracteres inválidos na hora da digitação
        await this.totalBudgetInput.pressSequentially(text);
        await this.totalBudgetInput.blur();
    }

    async getTotalBudgetValue() {
        return this.totalBudgetInput.inputValue();
    }
}
