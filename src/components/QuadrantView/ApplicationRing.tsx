import { computeRingNodes, type RingItem } from '@/utils/layout/ringLayout';
import { APPLICATIONS } from '@/data';
import { colorOfTheory } from '@/utils/theoryColor';

interface ApplicationRingProps {
  cx: number;
  cy: number;
  radius: number;
}

/**
 * 应用环（design.md §2.3）：位于时间环外侧，标注各理论的典型应用场景。
 * 一对多映射：若关联多个理论则使用渐变色过渡（此处取第一个理论色简化，真实场景可用渐变）。
 */
export function ApplicationRing({ cx, cy, radius }: ApplicationRingProps) {
  const items: RingItem[] = APPLICATIONS.map((app) => ({
    id: app.id,
    label: app.name,
    color: colorOfTheory(app.relatedTheories[0]),
  }));

  const nodes = computeRingNodes(items, { cx, cy, radius, startDeg: -90 });

  return (
    <g aria-label="应用环">
      {nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <rect
            x={-22}
            y={-10}
            width={44}
            height={20}
            rx={10}
            fill={node.color}
            fillOpacity={0.85}
            stroke="#0B1020"
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fill="#F8FAFC"
            className="select-none"
          >
            {node.label}
          </text>
        </g>
      ))}
    </g>
  );
}
