import { useMemo, useState } from 'react';
import { computeQuadrantLayout } from '@/utils/layout/quadrantLayout';
import { THEORIES } from '@/data';
import type { Theory, TheoryId } from '@/types';
import { QuadrantCell } from './QuadrantCell';

const VIEW_W = 1000;
const VIEW_H = 800;

interface QuadrantViewProps {
  onSelectTheory?: (id: TheoryId) => void;
}

/**
 * 四象限主视图（静态，M2）。
 * 以固定 viewBox + preserveAspectRatio 实现等比缩放的初步响应式；
 * 精细的断点堆叠留待 M9。关系箭头与环绕层在 M3 叠加。
 */
export function QuadrantView({ onSelectTheory }: QuadrantViewProps) {
  const layout = useMemo(
    () => computeQuadrantLayout({ width: VIEW_W, height: VIEW_H }),
    [],
  );
  const [hovered, setHovered] = useState<TheoryId | null>(null);

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
        {/* 象限交界的渐变模糊：中心融合带发光（design.md §2.1 模糊边界） */}
        <filter id="boundary-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="fusion-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 中央十字分隔（模糊柔化，非硬边界） */}
      <g filter="url(#boundary-blur)" stroke="#94A3B8" strokeOpacity={0.25} strokeWidth={2}>
        <line x1={midX} y1={plot.y} x2={midX} y2={plot.y + plot.height} />
        <line x1={plot.x} y1={midY} x2={plot.x + plot.width} y2={midY} />
      </g>
      <circle cx={midX} cy={midY} r={gap * 4} fill="url(#fusion-glow)" />

      {/* 坐标轴语义标签 */}
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

      {/* 四象限 */}
      {layout.boxes.map((box) => {
        const theory = theoryById.get(box.theoryId);
        if (!theory) return null;
        return (
          <QuadrantCell
            key={box.quadrant}
            box={box}
            theory={theory}
            focused={hovered === theory.id}
            onHover={setHovered}
            onSelect={(id) => onSelectTheory?.(id)}
          />
        );
      })}
    </svg>
  );
}
