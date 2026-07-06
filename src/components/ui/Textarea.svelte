<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    label?: string;
    hint?: string;
    error?: string;
    rows?: number;
    value?: string;
  }

  let { label, hint, error, rows = 3, id, value = $bindable(''), ...rest }: Props = $props();

  const generatedId = `textarea-${Math.random().toString(36).slice(2, 9)}`;
  const rid = $derived(id ?? generatedId);
  let focused = $state(false);

  const ringColor = $derived(error ? 'var(--danger)' : 'var(--accent)');
  const borderColor = $derived(error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border-strong)');
</script>

<div class="flex flex-col gap-1.5 w-full">
  {#if label}
    <label for={rid} class="ww-label">{label}</label>
  {/if}
  <div
    class="bg-[var(--surface-raised)] rounded-[var(--radius-md)] px-[var(--pad-control-x)] py-[var(--pad-control-y)] transition-[border-color,box-shadow] duration-[calc(var(--dur-fast)*1ms)] ease-[var(--ease)]"
    style:border="1px solid {borderColor}"
    style:box-shadow={focused
      ? `var(--shadow-inset), 0 0 0 3px color-mix(in srgb, ${ringColor} 32%, transparent)`
      : 'var(--shadow-inset)'}
  >
    <textarea
      id={rid}
      {rows}
      bind:value
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
      class="w-full min-w-0 resize-y border-none outline-none bg-transparent text-[length:var(--text-body)] text-[var(--text)] leading-[var(--lh-body)] font-[family-name:var(--font-body)]"
      {...rest}
    ></textarea>
  </div>
  {#if hint || error}
    <span
      class="text-[length:var(--text-sm)] font-[family-name:var(--font-body)]"
      style:color={error ? 'var(--danger-hover)' : 'var(--text-muted)'}
    >
      {error || hint}
    </span>
  {/if}
</div>
