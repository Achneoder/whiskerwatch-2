import { Given, Then, When } from '@cucumber/cucumber';
import type { Locator, Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

/** The faction card containing a given faction name — used to scope assertions to the right card. */
function factionCard(page: Page, name: string): Locator {
  return page.getByText(name, { exact: true }).locator('xpath=../..');
}

/** Selects the <option> whose visible text contains `text`, by reading its value first — the
 *  hex select's option labels ("C3 · Bramblewatch") aren't known ahead of time by the scenario. */
async function selectOptionContaining(select: Locator, text: string): Promise<void> {
  const value = await select.locator('option', { hasText: text }).first().getAttribute('value');
  if (!value) throw new Error(`No option containing "${text}" in select`);
  await select.selectOption(value);
}

When('the GM links the beat to the {string} hex', async function (this: WhiskerwatchWorld, hexName: string) {
  const dialog = this.page.getByRole('dialog');
  await selectOptionContaining(dialog.getByLabel('Linked hex'), hexName);
});

When('the GM links the beat to the {string} faction', async function (this: WhiskerwatchWorld, factionName: string) {
  const dialog = this.page.getByRole('dialog');
  await dialog.getByLabel('Faction').selectOption({ label: factionName });
  await dialog.getByRole('button', { name: 'Add faction' }).click();
});

When('the GM saves the beat', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
});

Given('the GM opens the {string} hex', async function (this: WhiskerwatchWorld, hexName: string) {
  await this.page.getByRole('button', { name: new RegExp(hexName) }).click();
});

Then('the GM should see {string} listed as a beat touching this hex', async function (this: WhiskerwatchWorld, beatTitle: string) {
  const dialog = this.page.getByRole('dialog');
  await dialog.getByText('Beats touching this hex').waitFor({ state: 'visible' });
  await dialog.getByText(beatTitle, { exact: true }).waitFor({ state: 'visible' });
});

When('the GM closes the hex detail', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
});

Then(
  'the GM should see {string} listed as a beat touching {string}',
  async function (this: WhiskerwatchWorld, beatTitle: string, factionName: string) {
    await factionCard(this.page, factionName).getByText(new RegExp(beatTitle)).waitFor({ state: 'visible' });
  },
);
