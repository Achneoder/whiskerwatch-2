import { strict as assert } from 'node:assert';
import { Then, When } from '@cucumber/cucumber';
import type { Locator, Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

// "the GM rolls an encounter" is already defined in hex-bestiary.steps.ts and
// reused here (including for the reroll) rather than redefined, to avoid an
// ambiguous step match.

/** The tracked instance row for a given label — mirrors `mouseCard` in live-session.steps.ts. */
function instanceRow(page: Page, label: string): Locator {
  return page.getByTestId(`encounter-instance-${label}`);
}

When('the GM adds another instance of the rolled creature', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: /^\+ Add another/ }).click();
});

Then('the GM should see the {string} instance', async function (this: WhiskerwatchWorld, label: string) {
  await instanceRow(this.page, label).waitFor({ state: 'visible' });
});

Then('the GM should not see the {string} instance', async function (this: WhiskerwatchWorld, label: string) {
  assert.equal(await instanceRow(this.page, label).count(), 0);
});

When(
  'the GM hurts the {string} instance for {int} damage',
  async function (this: WhiskerwatchWorld, label: string, amount: number) {
    const row = instanceRow(this.page, label);
    await row.getByRole('button', { name: 'Hurt' }).click();
    await row.getByRole('button', { name: String(amount), exact: true }).click();
  },
);

Then('the {string} instance should show as Defeated', async function (this: WhiskerwatchWorld, label: string) {
  await instanceRow(this.page, label).getByText('Defeated').waitFor({ state: 'visible' });
});

When('the GM removes the defeated {string} instance', async function (this: WhiskerwatchWorld, label: string) {
  await instanceRow(this.page, label).getByRole('button', { name: 'Remove' }).click();
});

When(
  'the GM removes the {string} instance from the corner "x"',
  async function (this: WhiskerwatchWorld, label: string) {
    await instanceRow(this.page, label)
      .getByRole('button', { name: `Remove ${label}` })
      .click();
  },
);

When('the GM undoes the encounter instance removal', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Undo' }).click();
});
