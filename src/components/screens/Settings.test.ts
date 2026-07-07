import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/svelte';
import Settings from './Settings.svelte';
import { setTheme } from '../../lib/stores/theme.svelte';
import { setLocale } from '../../lib/i18n';

const exportCampaign = vi.fn();
const importCampaign = vi.fn(async (_file: File) => {});

vi.mock('../../lib/campaignExport', () => ({
  exportCampaign: () => exportCampaign(),
  importCampaign: (file: File) => importCampaign(file),
}));

describe('Settings', () => {
  beforeEach(() => {
    setTheme('light');
    setLocale('en');
    exportCampaign.mockClear();
    importCampaign.mockClear();
    importCampaign.mockImplementation(async () => {});
  });

  afterEach(() => {
    setLocale('en');
    setTheme('light');
  });

  it('shows the "data lives only in this browser" notice', () => {
    render(Settings, { props: { onnavigate: vi.fn() } });
    expect(screen.getByText('Your campaign lives only in this browser.')).toBeInTheDocument();
  });

  it('switches the theme via the appearance segmented control', async () => {
    render(Settings, { props: { onnavigate: vi.fn() } });
    const dark = screen.getByRole('button', { name: 'Dark burrow', pressed: false });

    await fireEvent.click(dark);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark burrow' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches the language and re-renders labels in German', async () => {
    render(Settings, { props: { onnavigate: vi.fn() } });
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'Deutsch' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Einstellungen' })).toBeInTheDocument());
    expect(document.documentElement.lang).toBe('de');
  });

  it('exports the campaign in one tap and confirms', async () => {
    render(Settings, { props: { onnavigate: vi.fn() } });

    await fireEvent.click(screen.getByRole('button', { name: 'Export campaign' }));

    expect(exportCampaign).toHaveBeenCalledOnce();
    expect(screen.getByText('Saved to your downloads.')).toBeInTheDocument();
  });

  it('requires confirmation before importing (destructive)', async () => {
    const { container } = render(Settings, { props: { onnavigate: vi.fn() } });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'campaign.json', { type: 'application/json' });

    await fireEvent.change(fileInput, { target: { files: [file] } });

    // Nothing imported until the confirm dialog is accepted.
    expect(importCampaign).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Import and replace' }));

    await waitFor(() => expect(importCampaign).toHaveBeenCalledOnce());
    expect(await screen.findByText('Campaign restored.')).toBeInTheDocument();
  });

  it('cancelling the import dialog imports nothing', async () => {
    const { container } = render(Settings, { props: { onnavigate: vi.fn() } });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'campaign.json', { type: 'application/json' });

    await fireEvent.change(fileInput, { target: { files: [file] } });
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(importCampaign).not.toHaveBeenCalled();
  });

  it('surfaces an error when the imported file is invalid', async () => {
    importCampaign.mockRejectedValueOnce(new Error('That file is not valid JSON.'));
    const { container } = render(Settings, { props: { onnavigate: vi.fn() } });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['nope'], 'bad.json', { type: 'application/json' });

    await fireEvent.change(fileInput, { target: { files: [file] } });
    const dialog = screen.getByRole('dialog');
    await fireEvent.click(within(dialog).getByRole('button', { name: 'Import and replace' }));

    expect(await screen.findByText('That file is not valid JSON.')).toBeInTheDocument();
  });
});
