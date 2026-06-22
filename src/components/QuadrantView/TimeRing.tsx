import { computeRingNodes, type RingItem } from '@/utils/layout/ringLayout';
import { EVENTS } from '@/data';
import { colorOfTheory } from '@/utils/theoryColor';

interface TimeRingProps {
  cx: number;
  cy: number;
  radius: number;
}

/**
 * 时间环（design.md §2.3）：围绕四象限外圈，以弧形刻度标注关键历史节点。
 * 按年份排序、等角分布；继承锚定理论的主题色。
 */
export function TimeRing({ cx, cy, radius }: TimeRingProps) {
  const sorted = [...EVENTS].sort((a, b) => a.year - b.year);

  const items: RingItem[] = sorted.map((e) => ({
    id: e.id,
    label: `${e.year}`,
    sublabel: e.title,
    color: colorOfTheory(e.theoryId),
  }));

  const nodes = computeRingNodes(items, { cx, cy, radius, startDeg: -90 });

  return (
    <g aria-label="时间环">
      {nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <circle
            r={8}
            fill={node.color}
            fillOpacity={0.9}
            stroke="#0B1020"
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={-14}
            textAnchor="middle"
            fontSize={10}
            fill="#94A3B8"
            className="select-none"
          >
            {node.label}
          </text>
          <title>{`${node.sublabel} (${node.label})`}</title>
        </g>
      ))}
    </g>
  );
}
