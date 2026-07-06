<script lang="ts">
  import Button from './Button.svelte';

  interface Props {
    label: string;
    onclick?: (event: MouseEvent) => void;
    disabled?: boolean;
  }

  let { label, onclick, disabled = false }: Props = $props();
</script>

<Button {onclick} {disabled}>{label}</Button>
