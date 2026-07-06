<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'live';
    block?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: ((event: MouseEvent) => void) | undefined;
    icon?: Snippet;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    block = false,
    disabled = false,
    type = 'button',
    onclick,
    icon,
    children,
  }: Props = $props();

  const sizeClasses = {
    sm: 'gap-1.5 min-h-8 py-1.5 px-3 text-[length:var(--text-sm)]',
    md: 'gap-2 min-h-[var(--tap)] py-[var(--pad-control-y)] px-[var(--pad-control-x)] text-[length:var(--text-body)]',
    live: 'gap-2.5 min-h-[var(--tap)] py-[var(--sp-4)] px-[var(--sp-6)] text-[length:var(--text-title)]',
  } as const;

  const variantClasses = {
    primary:
      'bg-[var(--accent)] text-[var(--on-accent)] border border-[var(--accent)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]',
    secondary:
      'bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface)]',
    danger:
      'bg-[var(--danger)] text-[var(--on-danger)] border border-[var(--danger)] shadow-[var(--shadow-sm)] hover:bg-[var(--danger-hover)] hover:border-[var(--danger-hover)]',
    ghost:
      'bg-transparent text-[var(--accent)] border border-transparent hover:bg-[var(--accent-tint)]',
  } as const;
</script>

<button
  {type}
  {disabled}
  onclick={disabled ? undefined : onclick}
  class="{block ? 'flex w-full' : 'inline-flex w-auto'} items-center justify-center rounded-[var(--radius-md)] font-[family-name:var(--font-display)] font-semibold leading-none cursor-pointer disabled:pointer-events-none disabled:opacity-45 active:translate-y-px transition-[background,transform,border-color] duration-[calc(var(--dur-fast)*1ms)] ease-[var(--ease)] {sizeClasses[
    size
  ]} {variantClasses[variant]}"
>
  {#if icon}
    <span class="inline-flex shrink-0" aria-hidden="true">{@render icon()}</span>
  {/if}
  {@render children()}
</button>
