import { useId } from 'react';
import type { QuadrantBox } from '@/utils/layout/quadrantLayout';
import type { Theory, TheoryId } from '@/types';

interface QuadrantCellProps {
  box: QuadrantBox;
  theory: Theory;
  focused: boolean;
  dimmed?: boolean;
  inCompare?: boolean;
  compareMode?: boolean;
  onSelect: (theoryId: Theory['id']) => void;
  onHover: (theoryId: Theory['id'] | null) => void;
  onToggleCompare?: (id: TheoryId) => void;
}

/**
 * 单个象限格：主题色填充 + 支柱名称/场景 + hover 发光。
 * 筛选降饱和、对比模式选中指示。
 * 颜色之外以文字标签做冗余编码（claude.md 色觉无障碍要求）。
 */
export function QuadrantCell({
  box,
  theory,
  focused,
  dimmed = false,
  inCompare = false,
  compareMode = false,
  onSelect,
  onHover,
  onToggleCompare,
}: QuadrantCellProps) {
  const gradientId = useId();
  const { x, y, width, height, cx } = box;

  const opacity = dimmed ? 0.35 : 1;
  const baseStrokeOpacity = dimmed ? 0.2 : 0.55;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${theory.name}：${theory.scene}${inCompare ? '（已选中对比）' : ''}`}
      className="cursor-pointer focus:outline-none"
      onClick={() => {
        if (compareMode && onToggleCompare) {
          onToggleCompare(theory.id);
        } else {
          onSelect(theory.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (compareMode && onToggleCompare) {
            onToggleCompare(theory.id);
          } else {
            onSelect(theory.id);
          }
        }
      }}
      onMouseEnter={() => onHover(theory.id)}
      onMouseLeave={() => onHover(null)}
      style={{ transition: 'filter 200ms ease, opacity 200ms ease', opacity }}
      filter={focused && !dimmed ? `drop-shadow(0 0 14px ${theory.themeColor})` : undefined}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="75%">
          <stop
            offset="0%"
            stopColor={theory.themeColor}
            stopOpacity={dimmed ? 0.15 : focused ? 0.55 : 0.4}
          />
          <stop
            offset="100%"
            stopColor={theory.themeColor}
            stopOpacity={dimmed ? 0.04 : 0.12}
          />
        </radialGradient>
      </defs>

      {/* 对比选中边框 */}
      {inCompare && (
        <rect
          x={x - 3}
          y={y - 3}
          width={width + 6}
          height={height + 6}
          rx={21}
          fill="none"
          stroke={theory.themeColor}
          strokeWidth={3}
          strokeOpacity={0.9}
          strokeDasharray="8 4"
        />
      )}

      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        fill={`url(#${gradientId})`}
        stroke={theory.themeColor}
        strokeOpacity={focused && !dimmed ? 0.95 : baseStrokeOpacity}
        strokeWidth={focused && !dimmed ? 2.5 : 1.5}
      />

      <text
        x={cx}
        y={y + height / 2 - 8}
        textAnchor="middle"
        className="select-none font-semibold"
        fontSize={30}
        fill="#F8FAFC"
        style={{ opacity }}
      >
        {theory.name}
      </text>
      <text
        x={cx}
        y={y + height / 2 + 26}
        textAnchor="middle"
        className="select-none"
        fontSize={16}
        fill="#CBD5E1"
        style={{ opacity }}
      >
        {theory.scene}
      </text>

      {/* 对比模式指示器 */}
      {compareMode && (
        <g transform={`translate(${x + width - 16}, ${y + 16})`}>
          <circle r={12} fill={inCompare ? theory.themeColor : '#1E293B'} stroke={theory.themeColor} strokeWidth={1.5} />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fontSize={12}
            fill={inCompare ? '#0B1020' : '#64748B'}
            className="select-none"
          >
            {inCompare ? '✓' : '+'}
          </text>
        </g>
      )}
    </g>
  );
}
