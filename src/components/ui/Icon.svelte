<script lang="ts">
  import type { IconProps } from 'lucide-svelte';
  import type { ComponentType, SvelteComponent } from 'svelte';

  interface Props {
    icon: ComponentType<SvelteComponent<IconProps>>;
    size?: 'prep' | 'live';
    class?: string;
  }

  let { icon: IconComponent, size = 'prep', class: className = '' }: Props = $props();

  const px = $derived(size === 'live' ? 23 : 16);
</script>

<IconComponent size={px} strokeWidth={2} class={className} />
