import { useId } from 'react';
import type { QuadrantBox } from '@/utils/layout/quadrantLayout';
import type { Theory } from '@/types';

interface QuadrantCellProps {
  box: QuadrantBox;
  theory: Theory;
  focused: boolean;
  onSelect: (theoryId: Theory['id']) => void;
  onHover: (theoryId: Theory['id'] | null) => void;
}

/**
 * 单个象限格：主题色填充 + 支柱名称/场景 + hover 发光。
 * 颜色之外以文字标签做冗余编码（claude.md 色觉无障碍要求）。
 */
export function QuadrantCell({
  box,
  theory,
  focused,
  onSelect,
  onHover,
}: QuadrantCellProps) {
  const gradientId = useId();
  const { x, y, width, height, cx } = box;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${theory.name}：${theory.scene}`}
      className="cursor-pointer focus:outline-none"
      onClick={() => onSelect(theory.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(theory.id);
        }
      }}
      onMouseEnter={() => onHover(theory.id)}
      onMouseLeave={() => onHover(null)}
      style={{ transition: 'filter 200ms ease' }}
      filter={focused ? `drop-shadow(0 0 14px ${theory.themeColor})` : undefined}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor={theory.themeColor} stopOpacity={focused ? 0.55 : 0.4} />
          <stop offset="100%" stopColor={theory.themeColor} stopOpacity={0.12} />
        </radialGradient>
      </defs>

      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        fill={`url(#${gradientId})`}
        stroke={theory.themeColor}
        strokeOpacity={focused ? 0.95 : 0.55}
        strokeWidth={focused ? 2.5 : 1.5}
      />

      <text
        x={cx}
        y={y + height / 2 - 8}
        textAnchor="middle"
        className="select-none font-semibold"
        fontSize={30}
        fill="#F8FAFC"
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
      >
        {theory.scene}
      </text>
    </g>
  );
}
