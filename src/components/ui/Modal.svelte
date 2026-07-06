<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string | undefined;
    eyebrow?: string | undefined;
    actions?: Snippet;
    onclose?: () => void;
    width?: number;
    children: Snippet;
  }

  let { open = false, title, eyebrow, actions, onclose, width = 520, children }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onclose?.();
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div
    onclick={(e) => {
      if (e.target === e.currentTarget) onclose?.();
    }}
    role="presentation"
    class="fixed inset-0 z-100 flex items-center justify-center p-[var(--sp-4)] bg-[color-mix(in_srgb,#1d130a_62%,transparent)] backdrop-blur-[2px] motion-safe:animate-[ww-fade_calc(var(--dur)*1ms)_var(--ease)]"
  >
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      style:max-width="{width}px"
      class="w-full max-h-[90vh] flex flex-col bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] overflow-hidden motion-safe:animate-[ww-rise_calc(var(--dur-slow)*1ms)_var(--ease)]"
    >
      <div class="flex items-start justify-between gap-[var(--sp-3)] pt-[var(--sp-5)] px-[var(--sp-5)] pb-[var(--sp-3)]">
        <div>
          {#if eyebrow}
            <div class="ww-label text-[var(--accent)] mb-1">{eyebrow}</div>
          {/if}
          {#if title}
            <h2 class="text-[length:var(--text-h2)]">{title}</h2>
          {/if}
        </div>
        <button
          onclick={onclose}
          aria-label="Close"
          class="shrink-0 w-[var(--tap)] h-[var(--tap)] min-w-[34px] min-h-[34px] grid place-items-center cursor-pointer bg-transparent border-none rounded-[var(--radius-md)] text-[var(--text-muted)] text-[22px] leading-none"
        >
          &times;
        </button>
      </div>
      <div class="px-[var(--sp-5)] overflow-y-auto flex-1">{@render children()}</div>
      {#if actions}
        <div
          class="flex justify-end gap-[var(--gap-inline)] py-[var(--sp-4)] px-[var(--sp-5)] border-t border-[var(--border)] mt-[var(--sp-4)]"
        >
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes ww-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes ww-rise {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
</style>
