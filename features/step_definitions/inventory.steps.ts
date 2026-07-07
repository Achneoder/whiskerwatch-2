import { Given, Then, When } from '@cucumber/cucumber';
import type { Locator, Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

/** The roster row for a named mouse/hireling — used to scope the Edit click to the right row. */
function rosterRow(page: Page, name: string): Locator {
  return page.getByText(name, { exact: true }).locator('xpath=../..');
}

function itemEditor(page: Page): Locator {
  return page.getByTestId('item-editor');
}

Given('the GM opens {string} to edit', async function (this: WhiskerwatchWorld, name: string) {
  await rosterRow(this.page, name).getByRole('button', { name: 'Edit' }).click();
});

/** Fills and saves the inline item editor from an already-open empty slot / filled slot. */
async function saveItemDraft(page: Page, name: string): Promise<void> {
  const editor = itemEditor(page);
  await editor.getByLabel('Name').fill(name);
  await editor.getByRole('button', { name: 'Save' }).click();
}

When('the GM adds {string} to an empty inventory slot', async function (this: WhiskerwatchWorld, itemName: string) {
  await this.page.getByRole('button', { name: 'Empty slot, add item' }).first().click();
  await saveItemDraft(this.page, itemName);
});

When('the GM adds {int} items to the inventory', async function (this: WhiskerwatchWorld, count: number) {
  for (let i = 1; i <= count; i += 1) {
    await this.page.getByRole('button', { name: 'Empty slot, add item' }).first().click();
    await saveItemDraft(this.page, `Item ${i}`);
  }
});

When('the GM saves the mouse', async function (this: WhiskerwatchWorld) {
  // Scoped to the dialog's own Save button (not any leftover item-editor Save).
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
});

Then("the mouse's inventory should show {string}", async function (this: WhiskerwatchWorld, itemName: string) {
  await this.page
    .getByRole('dialog')
    .getByRole('button', { name: new RegExp(`^${itemName}, `) })
    .waitFor({ state: 'visible' });
});

Then('the GM should see the Overburdened warning', async function (this: WhiskerwatchWorld) {
  await this.page.getByText('Overburdened.').waitFor({ state: 'visible' });
});

Then('the GM can still add another item to the inventory', async function (this: WhiskerwatchWorld) {
  const addButton = this.page.getByRole('button', { name: 'Empty slot, add item' }).first();
  await addButton.waitFor({ state: 'visible' });
  await addButton.click();
  await saveItemDraft(this.page, 'One more thing');
  await itemEditor(this.page).waitFor({ state: 'hidden' });
});
