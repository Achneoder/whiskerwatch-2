import { Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

function header(world: WhiskerwatchWorld) {
  return world.page.locator('header');
}

Then('I should see {string} in the adventure picker chip', async function (this: WhiskerwatchWorld, adventureTitle: string) {
  await header(this)
    .getByRole('button', { name: new RegExp(`^Choose adventure, currently ${adventureTitle}$`) })
    .waitFor({ state: 'visible' });
});

Then('I should see {string} as the active beat', async function (this: WhiskerwatchWorld, beatTitle: string) {
  await header(this).getByText(beatTitle, { exact: true }).waitFor({ state: 'visible' });
});

When('the GM opens the adventure picker', async function (this: WhiskerwatchWorld) {
  await header(this)
    .getByRole('button', { name: /^Choose adventure, currently/ })
    .click();
});

Then(
  'I should see {string} as an option under {string}',
  async function (this: WhiskerwatchWorld, beatTitle: string, adventureTitle: string) {
    await this.page
      .getByRole('option', { name: new RegExp(`${adventureTitle}.*${beatTitle}`, 's') })
      .waitFor({ state: 'visible' });
  },
);

When('the GM picks {string} from the adventure picker', async function (this: WhiskerwatchWorld, adventureTitle: string) {
  await this.page.getByRole('option', { name: new RegExp(`^${adventureTitle}`) }).click();
});
