import { Given, Then, When } from '@cucumber/cucumber';
import type { Page } from 'playwright';
import type { WhiskerwatchWorld } from '../support/world';

When('I start a live session', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('button', { name: 'Start session' }).first().click();
});

Given('the GM has forced every roll to fail', async function (this: WhiskerwatchWorld) {
  // Pins Math.random so every d20 roll lands on 20 — the worst possible
  // roll-under result — without reaching into app internals or a test-only
  // seam. The app is already loaded (SPA, no further navigation), so this
  // patches the same JS realm the roll happens in.
  await this.page.evaluate(() => {
    Math.random = () => 0.999;
  });
});

When(
  'the GM rolls a save for {string} using {string}',
  async function (this: WhiskerwatchWorld, name: string, attribute: string) {
    await this.page.locator('select').selectOption({ label: name });
    await this.page.getByRole('button', { name: new RegExp(`^${attribute}`) }).click();
    await this.page.getByRole('button', { name: /^roll save$/i }).click();
  },
);

Then('I should see a save result showing a pass or a fail', async function (this: WhiskerwatchWorld) {
  await this.page.getByText(/Success|Failure/).waitFor({ state: 'visible' });
});

function mouseCard(page: Page, name: string) {
  return page.getByTestId(`mouse-card-${name}`);
}

/** Applies damage to the named mouse's card via the drawer chips / custom-amount stepper. */
async function applyDamage(page: Page, name: string, amount: number): Promise<void> {
  const card = mouseCard(page, name);
  await card.getByRole('button', { name: 'Hurt' }).click();

  if (amount >= 1 && amount <= 6) {
    await card.getByRole('button', { name: String(amount), exact: true }).click();
    return;
  }

  await card.getByRole('button', { name: /custom amount/i }).click();
  const diff = amount - 7; // the Stepper defaults to 7
  const step = diff >= 0 ? card.getByRole('button', { name: 'Increase' }) : card.getByRole('button', { name: 'Decrease' });
  for (let i = 0; i < Math.abs(diff); i += 1) {
    await step.click();
  }
  await card.getByRole('button', { name: 'Apply' }).click();
}

When('the GM applies {int} damage to {string}', async function (this: WhiskerwatchWorld, amount: number, name: string) {
  await applyDamage(this.page, name, amount);
});

When('the GM rolls the pending STR save for {string}', async function (this: WhiskerwatchWorld, name: string) {
  await mouseCard(this.page, name)
    .getByRole('button', { name: /roll str save/i })
    .click();
});

Then('{string} should show the {string} condition', async function (this: WhiskerwatchWorld, name: string, condition: string) {
  await mouseCard(this.page, name).getByText(condition, { exact: true }).first().waitFor({ state: 'visible' });
});

When('the GM confirms the death', async function (this: WhiskerwatchWorld) {
  await this.page.getByRole('dialog').getByRole('button', { name: 'Confirm death' }).click();
});

Then('{string} should appear in the Fallen list', async function (this: WhiskerwatchWorld, name: string) {
  await this.page.getByText(/^Fallen \(/).click();
  await this.page.getByText(name, { exact: true }).first().waitFor({ state: 'visible' });
});

When("the GM opens {string}'s bag", async function (this: WhiskerwatchWorld, name: string) {
  await mouseCard(this.page, name)
    .getByRole('button', { name: /^Open .*'s bag/ })
    .click();
});

/** The Live Session inventory modal opened via a mouse's Bag pill. */
function inventoryModal(page: Page) {
  return page.getByRole('dialog');
}

Then(
  'the bag should show {string} with {int} of {int} charges',
  async function (this: WhiskerwatchWorld, itemName: string, current: number, max: number) {
    await inventoryModal(this.page)
      .getByRole('button', { name: new RegExp(`^${itemName}, ${current} of ${max} charges`) })
      .waitFor({ state: 'visible' });
  },
);

When('the GM taps {string} in the bag', async function (this: WhiskerwatchWorld, itemName: string) {
  await inventoryModal(this.page)
    .getByRole('button', { name: new RegExp(`^${itemName}, `) })
    .click();
});

When('the GM undoes the charge', async function (this: WhiskerwatchWorld) {
  await inventoryModal(this.page).getByRole('button', { name: 'Undo' }).click();
});
