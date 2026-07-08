import { strict as assert } from 'node:assert';
import { Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

const HIRELING_LIMIT_WARNING = 'This party has more hirelings than its mice can command';

// "the GM rolls an encounter" is already defined in hex-bestiary.steps.ts and
// reused here (including for the reroll) rather than redefined, to avoid an
// ambiguous step match.

When('the GM rolls a reaction for the encounter', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Roll Reaction' }).click();
});

Then('I should see a reaction result showing a band and its guidance sentence', async function (this: WhiskerwatchWorld) {
  await this.page
    .getByText(/Hostile|Unfriendly|Neutral|Friendly|Helpful/)
    .first()
    .waitFor({ state: 'visible' });
  await this.page
    .getByText(
      /Attacks or otherwise acts against the party\.|Does the opposite of what's asked, may attack\.|Uncertain, will act to preserve itself\.|Does as asked, if not put in danger\.|Actively helps, and offers a service\./,
    )
    .first()
    .waitFor({ state: 'visible' });
});

Then(
  'the "Roll Reaction" button should be visible again with no reaction result showing',
  async function (this: WhiskerwatchWorld) {
    await this.page.getByRole('button', { name: 'Roll Reaction' }).waitFor({ state: 'visible' });
    // The band words double as headline text for the reaction result — none
    // of them should still be on screen once a fresh encounter clears it.
    const bandCount = await this.page.getByText(/^(Hostile|Unfriendly|Neutral|Friendly|Helpful)$/).count();
    assert.equal(bandCount, 0, 'expected no leftover reaction band label after rolling a new encounter');
  },
);

Then('the GM should see the hireling limit warning', async function (this: WhiskerwatchWorld) {
  await this.page.getByText(HIRELING_LIMIT_WARNING).waitFor({ state: 'visible' });
});

Then('the GM should not see the hireling limit warning', async function (this: WhiskerwatchWorld) {
  await this.page.getByText(HIRELING_LIMIT_WARNING).waitFor({ state: 'hidden' });
});

When('the GM removes every mouse from the warband', async function (this: WhiskerwatchWorld) {
  // Loop rather than a fixed count so this doesn't silently under/over-delete
  // if the seeded warband size ever changes.
  while (await this.page.locator('[data-testid^="party-row-"]').count()) {
    await this.page.locator('[data-testid^="party-row-"]').first().getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  }
});

When('the GM adds a mouse named {string} to the warband', async function (this: WhiskerwatchWorld, name: string) {
  await this.page.getByRole('button', { name: 'Add mouse' }).click();
  await this.page.getByRole('dialog').getByLabel('Name').fill(name);
  await this.page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
});
