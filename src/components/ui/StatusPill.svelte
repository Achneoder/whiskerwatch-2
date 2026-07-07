<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning' | 'clock';
    count?: number | null;
    of?: number | null;
    dot?: boolean;
    size?: 'sm' | 'md' | 'live';
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  }

  let {
    tone = 'neutral',
    count = null,
    of = null,
    dot = true,
    size = 'md',
    onclick,
    children,
  }: Props = $props();

  const toneClasses = {
    neutral: { text: 'text-[var(--text-secondary)]', bg: 'bg-[var(--surface-sunk)]', dot: 'bg-[var(--text-muted)]' },
    accent: { text: 'text-[var(--accent)]', bg: 'bg-[var(--accent-tint)]', dot: 'bg-[var(--accent)]' },
    danger: { text: 'text-[var(--danger-hover)]', bg: 'bg-[var(--danger-tint)]', dot: 'bg-[var(--danger)]' },
    success: { text: 'text-[var(--success)]', bg: 'bg-[var(--success-tint)]', dot: 'bg-[var(--success)]' },
    warning: { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning-tint)]', dot: 'bg-[var(--warning)]' },
    clock: { text: 'text-[var(--clock)]', bg: 'bg-[var(--clock-tint)]', dot: 'bg-[var(--clock)]' },
  } as const;

  const sizeClasses = {
    sm: { pad: 'py-[3px] px-2', font: 'text-[length:var(--text-caption)]', dotSz: 'w-1.5 h-1.5' },
    md: { pad: 'py-[5px] px-2.5', font: 'text-[length:var(--text-sm)]', dotSz: 'w-2 h-2' },
    live: { pad: 'py-2.5 px-4', font: 'text-[length:var(--text-body)]', dotSz: 'w-[11px] h-[11px]' },
  } as const;

  const t = $derived(toneClasses[tone]);
  const s = $derived(sizeClasses[size]);

  function handleKeydown(event: KeyboardEvent) {
    if (!onclick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onclick(event as unknown as MouseEvent);
    }
  }
</script>

<!--
  When an onclick is passed, this span becomes a button (role, keyboard handler,
  focusable tabindex all applied together). svelte-check can't see through the
  conditional role to know the tabindex is on an interactive element.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  {onclick}
  onkeydown={onclick ? handleKeydown : undefined}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  class="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] font-bold leading-none whitespace-nowrap {onclick
    ? 'cursor-pointer'
    : ''} {t.text} {t.bg} {s.pad} {s.font}"
>
  {#if dot}
    <span class="rounded-full shrink-0 {t.dot} {s.dotSz}"></span>
  {/if}
  {@render children()}
  {#if count != null}
    <span class="ww-num font-bold ml-0.5">{count}{#if of != null}<span class="opacity-60">/{of}</span>{/if}</span>
  {/if}
</span>
