import { useMemo, useState } from 'react';
import { computeQuadrantLayout } from '@/utils/layout/quadrantLayout';
import { THEORIES } from '@/data';
import {
  useFilterStore,
  theoryMatchesTags,
  getTheoriesForApplication,
} from '@/store/filterStore';
import type { Theory, TheoryId } from '@/types';
import { QuadrantCell } from './QuadrantCell';
import { RelationArrows } from './RelationArrows';
import { TimeRing } from './TimeRing';
import { ApplicationRing } from './ApplicationRing';

const VIEW_W = 1000;
const VIEW_H = 800;

const RING_PAD = 38;

interface QuadrantViewProps {
  onSelectTheory?: (id: TheoryId) => void;
  ringsVisible?: boolean;
  compareMode?: boolean;
  onToggleCompare?: (id: TheoryId) => void;
}

export function QuadrantView({
  onSelectTheory,
  ringsVisible = false,
  compareMode = false,
  onToggleCompare,
}: QuadrantViewProps) {
  const layout = useMemo(
    () => computeQuadrantLayout({ width: VIEW_W, height: VIEW_H }),
    [],
  );
  const [hovered, setHovered] = useState<TheoryId | null>(null);

  const activeTags = useFilterStore((s) => s.activeTags);
  const activeApplication = useFilterStore((s) => s.activeApplication);
  const compareSelection = useFilterStore((s) => s.compareSelection);

  const appRelatedIds = useMemo(
    () => (activeApplication ? new Set(getTheoriesForApplication(activeApplication)) : null),
    [activeApplication],
  );

  const theoryById = useMemo(() => {
    const map = new Map<TheoryId, Theory>();
    for (const t of THEORIES) map.set(t.id, t);
    return map;
  }, []);

  const { plot, gap } = layout;
  const midX = plot.x + plot.width / 2;
  const midY = plot.y + plot.height / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="group"
      aria-label="博弈论四象限理论版图"
    >
      <defs>
        <filter id="boundary-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="fusion-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
      </defs>

      <g filter="url(#boundary-blur)" stroke="#94A3B8" strokeOpacity={0.25} strokeWidth={2}>
        <line x1={midX} y1={plot.y} x2={midX} y2={plot.y + plot.height} />
        <line x1={plot.x} y1={midY} x2={plot.x + plot.width} y2={midY} />
      </g>
      <circle cx={midX} cy={midY} r={gap * 4} fill="url(#fusion-glow)" />

      {layout.axes.map((a, i) => (
        <text
          key={i}
          x={a.x}
          y={a.y}
          textAnchor={a.anchor}
          fontSize={15}
          fill="#94A3B8"
          className="select-none tracking-wide"
        >
          {a.text}
        </text>
      ))}

      {layout.boxes.map((box) => {
        const theory = theoryById.get(box.theoryId);
        if (!theory) return null;

        const tagMatch = theoryMatchesTags(theory.tags, activeTags);
        const appMatch = appRelatedIds ? appRelatedIds.has(theory.id) : true;
        const dimmed = activeTags.length > 0 || activeApplication !== null
          ? !(tagMatch && appMatch)
          : false;
        const inCompare = compareSelection.includes(theory.id);

        return (
          <QuadrantCell
            key={box.quadrant}
            box={box}
            theory={theory}
            focused={hovered === theory.id}
            dimmed={dimmed}
            inCompare={inCompare}
            compareMode={compareMode}
            onHover={setHovered}
            onSelect={onSelectTheory ?? (() => {})}
            onToggleCompare={onToggleCompare}
          />
        );
      })}

      <RelationArrows boxes={layout.boxes} />

      {ringsVisible && (
        <>
          <TimeRing cx={midX} cy={midY} radius={Math.max(plot.width, plot.height) / 2 + RING_PAD} />
          <ApplicationRing cx={midX} cy={midY} radius={Math.max(plot.width, plot.height) / 2 + RING_PAD + 52} />
        </>
      )}
    </svg>
  );
}
