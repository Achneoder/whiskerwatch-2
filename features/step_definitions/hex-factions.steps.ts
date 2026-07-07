import { Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

When(
  'the GM sets the controlling faction to {string}',
  async function (this: WhiskerwatchWorld, factionName: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Controlled by').selectOption({ label: factionName });
  },
);

When(
  'the GM adds {string} as a contesting faction',
  async function (this: WhiskerwatchWorld, factionName: string) {
    const dialog = this.page.getByRole('dialog');
    // Scoped to the "Contested by" block: the Hex form also has an Encounters
    // section with its own "Add" button, so a dialog-wide
    // `getByRole('button', { name: 'Add' })` would be ambiguous.
    const section = dialog.getByLabel('Contesting faction').locator('xpath=ancestor::div[2]');
    await section.getByLabel('Contesting faction').selectOption({ label: factionName });
    await section.getByRole('button', { name: 'Add' }).click();
  },
);

Then(
  'the GM should see {string} listed as the controlling faction',
  async function (this: WhiskerwatchWorld, factionName: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByText('Controlled by', { exact: true }).first().waitFor({ state: 'visible' });
    await dialog.getByText(factionName, { exact: true }).first().waitFor({ state: 'visible' });
  },
);

Then(
  'the GM should see {string} listed as a contesting faction',
  async function (this: WhiskerwatchWorld, factionName: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByText('Contested by', { exact: true }).first().waitFor({ state: 'visible' });
    await dialog.getByText(factionName, { exact: true }).first().waitFor({ state: 'visible' });
  },
);
