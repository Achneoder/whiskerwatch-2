import { When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

When('the GM taps the {string} row in Session Prep', async function (this: WhiskerwatchWorld, leadSubstring: string) {
  await this.page.getByRole('button', { name: new RegExp(leadSubstring) }).click();
});
