import { Given, Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

Given('I open Whiskerwatch', async function (this: WhiskerwatchWorld) {
  await this.goto('/');
});

Then('I should see {string} in the sidebar', async function (this: WhiskerwatchWorld, text: string) {
  await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
});

Then('I should see the {string} navigation entry', async function (this: WhiskerwatchWorld, label: string) {
  await this.page.getByRole('button', { name: label }).first().waitFor({ state: 'visible' });
});

When('I navigate to the {string} screen', async function (this: WhiskerwatchWorld, label: string) {
  await this.page.getByRole('button', { name: label }).first().click();
});

Then('I should see {string}', async function (this: WhiskerwatchWorld, text: string) {
  await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
});

Then('I should not see {string}', async function (this: WhiskerwatchWorld, text: string) {
  await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'hidden' });
});
