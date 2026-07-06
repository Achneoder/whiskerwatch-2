<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { axialToPixel, hexPolygonPoints, hexKey, gridCoords, gridViewBox, hexLabel, type Axial } from '../../lib/hex';
  import { terrainFill, type HexNode } from '../../lib/stores/hexmap.svelte';

  interface Props {
    hexes: HexNode[];
    selected?: { q: number; r: number } | null;
    onselect: (q: number, r: number) => void;
  }

  let { hexes, selected = null, onselect }: Props = $props();

  const cells = gridCoords();
  const [, , viewW, viewH] = gridViewBox().split(' ').map(Number);

  const byKey = $derived(new Map(hexes.map((h) => [hexKey(h.q, h.r), h])));

  function ariaFor(cell: Axial, node: HexNode | undefined): string {
    const label = hexLabel(cell.q, cell.r);
    if (!node) return label;
    const terrain = $_(`hexMap.terrain.${node.terrain}`);
    return node.name ? `${label}: ${node.name}, ${terrain}` : `${label}: ${terrain}`;
  }

  function truncate(text: string): string {
    return text.length > 10 ? text.slice(0, 9) + '…' : text;
  }

  function handleKeydown(event: KeyboardEvent, q: number, r: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onselect(q, r);
    }
  }
</script>

<div class="overflow-auto max-w-full rounded-[var(--radius-md)]" style="touch-action: pan-x pan-y;">
  <svg
    width={viewW}
    height={viewH}
    viewBox={gridViewBox()}
    role="group"
    aria-label={$_('hexMap.title')}
    class="block"
    style="max-width: none;"
  >
    {#each cells as cell (hexKey(cell.q, cell.r))}
      {@const p = axialToPixel(cell.q, cell.r)}
      {@const node = byKey.get(hexKey(cell.q, cell.r))}
      {@const isSelected = selected != null && selected.q === cell.q && selected.r === cell.r}
      <g
        role="button"
        tabindex="0"
        aria-label={ariaFor(cell, node)}
        class="cursor-pointer"
        onclick={() => onselect(cell.q, cell.r)}
        onkeydown={(e) => handleKeydown(e, cell.q, cell.r)}
      >
        <polygon
          points={hexPolygonPoints(p.x, p.y)}
          fill={node ? terrainFill[node.terrain] : 'var(--surface-raised)'}
          fill-opacity={node && !node.discovered ? 0.5 : 1}
          stroke={isSelected ? 'var(--accent)' : 'var(--border)'}
          stroke-width={isSelected ? 3 : 1}
          stroke-dasharray={node && !node.discovered ? '4 3' : undefined}
        />
        {#if node && node.name}
          <text
            x={p.x}
            y={p.y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="var(--text)"
            class="font-[family-name:var(--font-display)]"
            style="font-size: 11px; font-weight: 700; pointer-events: none;"
          >
            {truncate(node.name)}
          </text>
        {/if}
      </g>
    {/each}
  </svg>
</div>
