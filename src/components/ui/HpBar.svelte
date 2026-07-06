<script lang="ts">
  interface Props {
    value?: number;
    max?: number;
    label?: string;
    tone?: 'auto' | 'hp' | 'accent' | 'success' | 'warning';
    mode?: 'auto' | 'pips' | 'bar';
    showValue?: boolean;
    size?: 'sm' | 'md' | 'live';
  }

  let {
    value = 0,
    max = 6,
    label = 'HP',
    tone = 'auto',
    mode = 'auto',
    showValue = true,
    size = 'md',
  }: Props = $props();

  const pct = $derived(max > 0 ? Math.max(0, Math.min(1, value / max)) : 0);

  const color = $derived.by(() => {
    if (tone === 'hp') return 'var(--hp)';
    if (tone === 'success') return 'var(--success)';
    if (tone === 'warning') return 'var(--warning)';
    if (tone === 'accent') return 'var(--accent)';
    if (pct <= 0.25) return 'var(--hp)';
    if (pct <= 0.5) return 'var(--warning)';
    return 'var(--success)';
  });

  const usePips = $derived(mode === 'pips' || (mode === 'auto' && max <= 12));
  const trackH = $derived({ sm: 8, md: 12, live: 18 }[size]);
  const pipH = $derived({ sm: 14, md: 20, live: 30 }[size]);
  const pipGap = $derived(size === 'live' ? 'gap-1.5' : 'gap-1');
</script>

<div class="flex flex-col gap-1.5 w-full">
  {#if label || showValue}
    <div class="flex items-baseline justify-between gap-2">
      {#if label}
        <span class="ww-label">{label}</span>
      {/if}
      {#if showValue}
        <span
          class="ww-num font-bold text-[var(--text)] leading-none"
          style:font-size={size === 'live' ? 'var(--stat-md)' : 'var(--stat-sm)'}
        >
          {value}<span class="text-[var(--text-faint)]">/{max}</span>
        </span>
      {/if}
    </div>
  {/if}

  {#if usePips}
    <div class="flex {pipGap}">
      {#each Array.from({ length: max }) as _, i (i)}
        <div
          class="flex-1 min-w-1.5 rounded-[var(--radius-sm)] transition-colors duration-[calc(var(--dur)*1ms)] ease-[var(--ease)]"
          style:height="{pipH}px"
          style:background={i < value ? color : 'var(--surface-sunk)'}
          style:border={i < value ? '1px solid transparent' : '1px solid var(--border)'}
          style:box-shadow={i < value ? 'var(--shadow-sm)' : 'var(--shadow-inset)'}
        ></div>
      {/each}
    </div>
  {:else}
    <div
      class="rounded-[var(--radius-pill)] bg-[var(--surface-sunk)] shadow-[var(--shadow-inset)] overflow-hidden"
      style:height="{trackH}px"
    >
      <div
        class="h-full rounded-[var(--radius-pill)] transition-[width,background] duration-[calc(var(--dur-slow)*1ms)] ease-[var(--ease)]"
        style:width="{pct * 100}%"
        style:background={color}
      ></div>
    </div>
  {/if}
</div>
