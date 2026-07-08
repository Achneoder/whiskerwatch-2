import { Given } from '@cucumber/cucumber';
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
