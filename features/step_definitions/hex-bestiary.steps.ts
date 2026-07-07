import { strict as assert } from 'node:assert';
import { Then, When } from '@cucumber/cucumber';
import type { Locator, Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

/** The bestiary card containing a given creature name — used to scope the Delete click to the right card. */
function bestiaryCard(page: Page, name: string): Locator {
  return page.getByText(name, { exact: true }).locator('xpath=ancestor::div[.//button[@aria-label="Delete"]][1]');
}

When(
  'the GM links the {string} creature to this hex with weight {int}',
  async function (this: WhiskerwatchWorld, creatureName: string, weight: number) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Bestiary entry').selectOption({ label: creatureName });
    const increase = dialog.getByRole('button', { name: 'Increase' });
    for (let i = 1; i < weight; i++) {
      await increase.click();
    }
    await dialog.getByRole('button', { name: 'Add' }).click();
  },
);

When('the GM saves the hex', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
});

Then('the GM should see {string} listed as an encounter here', async function (this: WhiskerwatchWorld, label: string) {
  const dialog = this.page.getByRole('dialog');
  await dialog.getByText('Encounters here').waitFor({ state: 'visible' });
  await dialog.getByText(label, { exact: true }).waitFor({ state: 'visible' });
});

Then(
  'the GM should not see {string} listed as an encounter here',
  async function (this: WhiskerwatchWorld, name: string) {
    const dialog = this.page.getByRole('dialog');
    // The whole "Encounters here" block only renders when the hex has at least
    // one resolvable encounter — deleting the linked bestiary entry should
    // make it (and the stale creature name) disappear entirely, not just show a blank.
    assert.equal(await dialog.getByText('Encounters here').count(), 0);
    assert.equal(await dialog.getByText(name, { exact: true }).count(), 0);
  },
);

When(
  'the GM selects the {string} hex in the encounter generator',
  async function (this: WhiskerwatchWorld, hexName: string) {
    const select = this.page.getByLabel('Hex');
    const value = await select.locator('option', { hasText: hexName }).first().getAttribute('value');
    if (!value) throw new Error(`No option containing "${hexName}" in the hex select`);
    await select.selectOption(value);
  },
);

When('the GM rolls an encounter', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Roll an encounter' }).click();
});

Then('the GM should see the {string} stat block', async function (this: WhiskerwatchWorld, creatureName: string) {
  await this.page.getByText(creatureName, { exact: true }).waitFor({ state: 'visible' });
});

When('the GM deletes the {string} bestiary entry', async function (this: WhiskerwatchWorld, name: string) {
  await bestiaryCard(this.page, name).getByRole('button', { name: 'Delete' }).click();
  await this.page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
});
