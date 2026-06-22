import { computeRelationGeometry } from '@/utils/layout/relationLayout';
import { RELATIONS } from '@/data';
import type { QuadrantBox } from '@/utils/layout/quadrantLayout';

const ARROW_COLOR = '#E2E8F0';
const LABEL_SIZE = 13;

interface RelationArrowsProps {
  boxes: QuadrantBox[];
}

/**
 * 四象限上叠加的理论关系箭头 —— 核心叙事主干（design.md §2.2）。
 * 实线表示推广/精炼/转换，虚线双向表示融合（完美贝叶斯均衡）。
 */
export function RelationArrows({ boxes }: RelationArrowsProps) {
  const geos = computeRelationGeometry(RELATIONS, boxes);

  return (
    <g aria-label="理论间继承与批判关系">
      <defs>
        <marker
          id="rel-arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_COLOR} />
        </marker>
      </defs>

      {geos.map((g) => {
        const labelWidth = g.label.length * LABEL_SIZE * 0.62 + 12;
        return (
          <g key={g.key}>
            <line
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              stroke={ARROW_COLOR}
              strokeWidth={2}
              strokeOpacity={0.85}
              strokeDasharray={g.dashed ? '7 6' : undefined}
              markerEnd="url(#rel-arrowhead)"
              markerStart={g.doubleHeaded ? 'url(#rel-arrowhead)' : undefined}
            />
            <g transform={`translate(${g.labelX}, ${g.labelY})`}>
              <rect
                x={-labelWidth / 2}
                y={-LABEL_SIZE}
                width={labelWidth}
                height={LABEL_SIZE * 2}
                rx={6}
                fill="#0B1020"
                fillOpacity={0.82}
                stroke={ARROW_COLOR}
                strokeOpacity={0.25}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={LABEL_SIZE}
                fill="#E2E8F0"
                className="select-none"
              >
                {g.label}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
