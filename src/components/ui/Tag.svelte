<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'default' | 'accent' | 'danger' | 'success' | 'warning' | 'clock';
    solid?: boolean;
    size?: 'sm' | 'md';
    children: Snippet;
  }

  let { tone = 'default', solid = false, size = 'md', children }: Props = $props();

  const hues = {
    default: 'var(--text-muted)',
    accent: 'var(--accent)',
    danger: 'var(--danger)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    clock: 'var(--clock)',
  } as const;

  const tints = {
    default: 'var(--surface-sunk)',
    accent: 'var(--accent-tint)',
    danger: 'var(--danger-tint)',
    success: 'var(--success-tint)',
    warning: 'var(--warning-tint)',
    clock: 'var(--clock-tint)',
  } as const;

  const sizeClasses = {
    sm: 'py-0.5 px-1.5 text-[length:var(--text-caption)]',
    md: 'py-[3px] px-2 text-[length:var(--text-sm)]',
  } as const;

  const hue = $derived(hues[tone]);
</script>

<span
  class="inline-flex items-center font-bold leading-[1.2] tracking-[0.02em] rounded-[var(--radius-sm)] {sizeClasses[size]}"
  style:color={solid ? 'var(--on-accent)' : hue}
  style:background={solid ? hue : tints[tone]}
  style:border={solid ? '1px solid transparent' : `1px solid color-mix(in srgb, ${hue} 30%, transparent)`}
>
  {@render children()}
</span>
