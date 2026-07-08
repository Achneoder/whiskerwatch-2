import { Given, When } from '@cucumber/cucumber';
import type { Locator, Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

/**
 * The adventure card containing a given adventure title — scopes an "Add
 * beat" click to the right adventure now that the Adventure screen stacks
 * one card per adventure (see `Adventure.svelte`).
 */
function adventureCard(page: Page, title: string): Locator {
  return page.getByText(title, { exact: true }).locator('xpath=../../..');
}

async function openAddBeatDialog(page: Page, adventureTitle: string, beatTitle: string): Promise<void> {
  await adventureCard(page, adventureTitle).getByRole('button', { name: 'Add beat' }).click();
  await page.getByRole('dialog').getByLabel('Title').fill(beatTitle);
}

// Opens the "Add beat" dialog scoped to `adventureTitle` and fills in the
// title, but leaves the dialog open — for scenarios that need to link a hex
// or faction before saving (see beat-links.feature).
Given(
  'the GM starts a new beat titled {string} under {string}',
  async function (this: WhiskerwatchWorld, beatTitle: string, adventureTitle: string) {
    await openAddBeatDialog(this.page, adventureTitle, beatTitle);
  },
);

// Self-contained add-and-save, for scenarios that just need a beat to exist
// under a given adventure (see dashboard.feature, timeline.feature).
Given(
  'the GM adds a beat titled {string} to {string}',
  async function (this: WhiskerwatchWorld, beatTitle: string, adventureTitle: string) {
    await openAddBeatDialog(this.page, adventureTitle, beatTitle);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  },
);

// Same as above but marks the new beat Active before saving — used to set up
// concurrent-adventure scenarios (see adventure-picker.feature) where more
// than one adventure needs a live active beat at once. The status <select>
// has no accessible label of its own (just an adjacent, unassociated span),
// so it's addressed positionally as the dialog's first <select> — it's
// always rendered first in `BeatForm`, ahead of the labelled hex/faction pickers.
Given(
  'the GM adds an active beat titled {string} to {string}',
  async function (this: WhiskerwatchWorld, beatTitle: string, adventureTitle: string) {
    await openAddBeatDialog(this.page, adventureTitle, beatTitle);
    await this.page.getByRole('dialog').locator('select').first().selectOption({ label: 'Active' });
    await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  },
);

// Creates a brand-new adventure via the "Add adventure" flow — for scenarios
// that need a second, independent adventure/beat-tree to exist (see
// adventure-picker.feature).
Given('the GM adds an adventure titled {string}', async function (this: WhiskerwatchWorld, title: string) {
  await this.page.getByRole('button', { name: 'Add adventure' }).click();
  await this.page.getByRole('dialog').getByLabel('Title').fill(title);
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  await this.page.getByText(title, { exact: true }).first().waitFor({ state: 'visible' });
});

// Same as above, but sets the new adventure's status straight to Completed —
// for exercising the Adventure screen's "Completed (N)" collapse (see
// adventure-completed.feature). `AdventureForm`'s status <select> has no
// accessible label of its own, so it's addressed positionally as the
// dialog's only <select>.
Given('the GM adds a completed adventure titled {string}', async function (this: WhiskerwatchWorld, title: string) {
  await this.page.getByRole('button', { name: 'Add adventure' }).click();
  await this.page.getByRole('dialog').getByLabel('Title').fill(title);
  await this.page.getByRole('dialog').locator('select').first().selectOption({ label: 'Completed' });
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
});

When('the GM expands the completed adventures section', async function (this: WhiskerwatchWorld) {
  await this.page.getByText(/^Completed \(/).click();
});
