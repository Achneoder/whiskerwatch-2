import { Given, Then, When } from '@cucumber/cucumber';
import type { WhiskerwatchWorld } from '../support/world';

When("the GM bumps {string}'s faction clock", async function (this: WhiskerwatchWorld, factionName: string) {
  await this.page.getByRole('button', { name: factionName }).click();
});

When('the GM ends the session', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: /end session/i }).click();
});

Then('I should see {string} in the recap checklist', async function (this: WhiskerwatchWorld, text: string) {
  await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
});

When('the GM unchecks the recap fact {string}', async function (this: WhiskerwatchWorld, text: string) {
  const row = this.page.locator('label', { hasText: text });
  await row.getByRole('checkbox').uncheck();
});

When('the GM drafts the recap', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: /draft recap/i }).click();
});

function summaryField(world: WhiskerwatchWorld) {
  return world.page.getByLabel('Summary');
}

Then('the session summary field should contain {string}', async function (this: WhiskerwatchWorld, text: string) {
  const value = await summaryField(this).inputValue();
  if (!value.includes(text)) {
    throw new Error(`Expected the session summary field to contain ${JSON.stringify(text)}, got ${JSON.stringify(value)}`);
  }
});

Then('the session summary field should not contain {string}', async function (this: WhiskerwatchWorld, text: string) {
  const value = await summaryField(this).inputValue();
  if (value.includes(text)) {
    throw new Error(`Expected the session summary field NOT to contain ${JSON.stringify(text)}, got ${JSON.stringify(value)}`);
  }
});

When('the GM appends {string} to the session summary', async function (this: WhiskerwatchWorld, extra: string) {
  const field = summaryField(this);
  const current = await field.inputValue();
  await field.fill(`${current}${extra}`);
});

When('the GM enters {string} as the session title', async function (this: WhiskerwatchWorld, title: string) {
  await this.page.getByLabel('Title').fill(title);
});

When('the GM saves the session', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Save' }).click();
});

Then('I should see {string} in the session log', async function (this: WhiskerwatchWorld, text: string) {
  await this.page.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
});
