<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { dispositionRingColor, type Faction } from '../../lib/stores/factions.svelte';
  import { relationEdgeStyle, type FactionEdge, type FactionRelationType } from '../../lib/stores/factionEdges.svelte';

  interface Props {
    factions: Faction[];
    edges: FactionEdge[];
    selectedId?: string | null;
    onselect?: (faction: Faction) => void;
  }

  let { factions, edges, selectedId = null, onselect }: Props = $props();

  const NODE_R = 9;
  const RING_R = 11;
  const LAYOUT_R = 37;

  const positions = $derived.by(() => {
    const map = new Map<string, { x: number; y: number }>();
    const n = factions.length;
    factions.forEach((f, i) => {
      if (n === 1) {
        map.set(f.id, { x: 50, y: 50 });
      } else if (n === 2) {
        map.set(f.id, { x: i === 0 ? 25 : 75, y: 50 });
      } else {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        map.set(f.id, { x: 50 + LAYOUT_R * Math.cos(angle), y: 50 + LAYOUT_R * Math.sin(angle) });
      }
    });
    return map;
  });

  const drawableEdges = $derived(
    edges
      .map((edge) => {
        const s = positions.get(edge.sourceId);
        const t = positions.get(edge.targetId);
        if (!s || !t) return null;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        const ox = (dx / len) * RING_R;
        const oy = (dy / len) * RING_R;
        const touchesSelected = selectedId != null && (edge.sourceId === selectedId || edge.targetId === selectedId);
        return {
          edge,
          x1: s.x + ox,
          y1: s.y + oy,
          x2: t.x - ox,
          y2: t.y - oy,
          dim: selectedId != null && !touchesSelected,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null),
  );

  const legendRelations: FactionRelationType[] = ['ally', 'enemy', 'rival'];

  function clockPct(f: Faction): number {
    return f.of > 0 ? Math.max(0, Math.min(100, (f.clock / f.of) * 100)) : 0;
  }

  function handleKeydown(event: KeyboardEvent, faction: Faction) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onselect?.(faction);
    }
  }
</script>

{#if factions.length === 0}
  <p class="text-[var(--text-muted)] text-[length:var(--text-body)]">{$_('factions.graph.empty')}</p>
{:else}
  <div class="flex flex-col gap-[var(--sp-4)]">
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="w-full h-auto" role="group" aria-label={$_('factions.graph.heading')}>
      {#each drawableEdges as d (d.edge.id)}
        <line
          x1={d.x1}
          y1={d.y1}
          x2={d.x2}
          y2={d.y2}
          stroke={relationEdgeStyle[d.edge.type].color}
          stroke-width={relationEdgeStyle[d.edge.type].width}
          stroke-dasharray={relationEdgeStyle[d.edge.type].dash || undefined}
          stroke-linecap="round"
          opacity={d.dim ? 0.2 : 0.9}
        />
      {/each}

      {#each factions as faction (faction.id)}
        {@const p = positions.get(faction.id)}
        {#if p}
          <g
            role="button"
            tabindex="0"
            aria-label={faction.name}
            class="cursor-pointer"
            onclick={() => onselect?.(faction)}
            onkeydown={(e) => handleKeydown(e, faction)}
          >
            <!-- clock track + progress arc -->
            <circle cx={p.x} cy={p.y} r={RING_R} fill="none" stroke="var(--clock-tint)" stroke-width="2" />
            <circle
              cx={p.x}
              cy={p.y}
              r={RING_R}
              fill="none"
              stroke="var(--clock)"
              stroke-width="2"
              stroke-linecap="round"
              pathLength="100"
              stroke-dasharray="{clockPct(faction)} 100"
              transform="rotate(-90 {p.x} {p.y})"
            />
            <!-- disposition ring + body -->
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill="var(--surface-raised)"
              stroke={dispositionRingColor[faction.disposition]}
              stroke-width={selectedId === faction.id ? 2.4 : 1.4}
            />
            <text
              x={p.x}
              y={p.y - 0.6}
              text-anchor="middle"
              dominant-baseline="middle"
              class="font-[family-name:var(--font-display)]"
              fill="var(--text)"
              style="font-size: 2.7px; font-weight: 700;"
            >
              {faction.name.length > 14 ? faction.name.slice(0, 13) + '…' : faction.name}
            </text>
            <text
              x={p.x}
              y={p.y + 4}
              text-anchor="middle"
              dominant-baseline="middle"
              fill="var(--clock)"
              style="font-size: 2.6px; font-weight: 700;"
            >
              {faction.clock}/{faction.of}
            </text>
          </g>
        {/if}
      {/each}
    </svg>

    <div class="flex flex-wrap gap-[var(--sp-3)] text-[length:var(--text-caption)] text-[var(--text-muted)]">
      {#each legendRelations as rel (rel)}
        <span class="inline-flex items-center gap-1.5">
          <span
            class="inline-block w-4 h-0"
            style="border-top: {relationEdgeStyle[rel].width * 1.5}px {rel === 'rival' ? 'dashed' : 'solid'} {relationEdgeStyle[rel].color};"
          ></span>
          {$_(`factions.relation.${rel}`)}
        </span>
      {/each}
    </div>
  </div>
{/if}
