<script lang="ts">
  import { _ } from 'svelte-i18n';
  import {
    axialToPixel,
    hexPolygonPoints,
    insetHexPoints,
    hexKey,
    gridCoords,
    gridViewBox,
    hexLabel,
    type Axial,
  } from '../../lib/hex';
  import { terrainFill, type HexNode } from '../../lib/stores/hexmap.svelte';
  import { dispositionRingColor, type Faction, type FactionDisposition } from '../../lib/stores/factions.svelte';

  interface Props {
    hexes: HexNode[];
    selected?: { q: number; r: number } | null;
    factions?: Faction[];
    onselect: (q: number, r: number) => void;
  }

  let { hexes, selected = null, factions = [], onselect }: Props = $props();

  const cells = gridCoords();
  const [, , viewW, viewH] = gridViewBox().split(' ').map(Number);

  const byKey = $derived(new Map(hexes.map((h) => [hexKey(h.q, h.r), h])));
  const factionById = $derived(new Map(factions.map((f) => [f.id, f])));

  /** Fixed outer→inner draw order for contested rings — hostile territory reads as the most urgent, drawn first (outermost). */
  const DISPOSITION_ORDER: FactionDisposition[] = ['hostile', 'neutral', 'ally'];

  interface TerritoryRing {
    scale: number;
    color: string;
    dashed: boolean;
  }

  function territoryRings(node: HexNode | undefined): TerritoryRing[] {
    if (!node) return [];
    const rings: TerritoryRing[] = [];

    const controller = node.controlledBy ? factionById.get(node.controlledBy) : undefined;
    if (controller) {
      rings.push({ scale: 0.82, color: dispositionRingColor[controller.disposition], dashed: false });
    }

    const contesterDispositions = new Set(
      node.contestedBy.map((id) => factionById.get(id)?.disposition).filter((d): d is FactionDisposition => d !== undefined),
    );
    const orderedDispositions = DISPOSITION_ORDER.filter((d) => contesterDispositions.has(d));
    const startScale = controller ? 0.72 : 0.82;
    orderedDispositions.forEach((disposition, i) => {
      rings.push({ scale: startScale - i * 0.08, color: dispositionRingColor[disposition], dashed: true });
    });

    return rings;
  }

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
        {#each territoryRings(node) as ring, i (i)}
          <polygon
            points={insetHexPoints(p.x, p.y, ring.scale)}
            fill="none"
            stroke={ring.color}
            stroke-width={2}
            stroke-dasharray={ring.dashed ? '3 2' : undefined}
          />
        {/each}
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
