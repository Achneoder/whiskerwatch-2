import { Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

When('the GM opens the rules reference drawer', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Rules reference' }).click();
});

When('the GM closes the rules reference drawer', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog', { name: 'Rules reference' }).getByRole('button', { name: 'Close' }).click();
});

Then('the GM should see the rules reference drawer', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog', { name: 'Rules reference' }).waitFor({ state: 'visible' });
});

Then('the GM should not see the rules reference drawer', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog', { name: 'Rules reference' }).waitFor({ state: 'hidden' });
});

Then('the GM should see the {string} rules section', async function (this: WhiskerwatchWorld, heading: string) {
  await this.page
    .getByRole('dialog', { name: 'Rules reference' })
    .getByRole('heading', { name: heading })
    .waitFor({ state: 'visible' });
});
