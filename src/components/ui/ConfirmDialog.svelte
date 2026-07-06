<script lang="ts">
  import type { Snippet } from 'svelte';
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  interface Props {
    open?: boolean;
    title?: string | undefined;
    message?: string | undefined;
    confirmLabel: string;
    cancelLabel: string;
    danger?: boolean;
    onconfirm: () => void;
    oncancel: () => void;
    children?: Snippet;
  }

  let {
    open = false,
    title,
    message,
    confirmLabel,
    cancelLabel,
    danger = false,
    onconfirm,
    oncancel,
    children,
  }: Props = $props();
</script>

<Modal {open} {title} onclose={oncancel} width={420}>
  {#if children}
    {@render children()}
  {:else if message}
    <p class="text-[var(--text-secondary)] text-[length:var(--text-body)]">{message}</p>
  {/if}
  {#snippet actions()}
    <Button variant="ghost" onclick={oncancel}>{cancelLabel}</Button>
    <Button variant={danger ? 'danger' : 'primary'} onclick={onconfirm}>{confirmLabel}</Button>
  {/snippet}
</Modal>
