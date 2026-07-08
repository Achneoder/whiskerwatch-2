import { Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

When(
  'the GM adds a scar to {string} labeled {string}',
  async function (this: WhiskerwatchWorld, name: string, label: string) {
    await this.page.getByRole('button', { name: new RegExp(`add a scar for ${name}`, 'i') }).click();
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Label').fill(label);
    await dialog.getByRole('button', { name: 'Add Scar' }).click();
  },
);

Then('{string} should show the {string} scar', async function (this: WhiskerwatchWorld, _name: string, scarLabel: string) {
  await this.page.getByText(scarLabel, { exact: true }).first().waitFor({ state: 'visible' });
});

When(
  'the GM confirms the death with the cause {string}',
  async function (this: WhiskerwatchWorld, cause: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Cause of death (optional)').fill(cause);
    await dialog.getByRole('button', { name: 'Confirm death' }).click();
  },
);
