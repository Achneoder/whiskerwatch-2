import { Then, When } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import type { WhiskerwatchWorld } from '../support/world';

When('I switch the language to German', async function (this: WhiskerwatchWorld) {
  // Scope to the Language segmented control so we don't collide with the
  // sidebar's own language toggle.
  await this.page.getByRole('group', { name: 'Language' }).getByRole('button', { name: 'Deutsch' }).click();
});

When('I switch the theme to {word}', async function (this: WhiskerwatchWorld, theme: string) {
  const label = theme === 'dark' ? 'Dark burrow' : 'Light burrow';
  // Scope to the Appearance segmented control so we don't collide with the
  // sidebar's own theme toggle button.
  await this.page.getByRole('group', { name: 'Appearance' }).getByRole('button', { name: label }).click();
});

Then('the app uses the {string} theme', async function (this: WhiskerwatchWorld, theme: string) {
  await this.page.waitForFunction(
    (expected) => document.documentElement.getAttribute('data-theme') === expected,
    theme,
  );
  const actual = await this.page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  assert.equal(actual, theme);
});

When('I choose an invalid file to import', async function (this: WhiskerwatchWorld) {
  // Set the file directly on the hidden input — this fires the same change
  // handler the styled "Import campaign" button triggers, without opening a
  // native OS file chooser that the test would then have to intercept.
  await this.page.locator('input[type="file"]').setInputFiles({
    name: 'not-a-campaign.json',
    mimeType: 'application/json',
    buffer: Buffer.from('this is not json'),
  });
});
