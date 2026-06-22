import type { PointerEvent as ReactPointerEvent } from 'react';

export interface DragHandleProps {
  /** 像素坐标圆心。 */
  cx: number;
  cy: number;
  /** 控制点序号（0 起）。用于 aria 标签与拖拽回调。 */
  index: number;
  /** 主题色填充。 */
  color: string;
  /** 半径，默认 7。 */
  r?: number;
  /** 拖拽轴决定光标样式：'y'→ns-resize，'x'→ew-resize。 */
  axis?: 'x' | 'y';
  /** 当前 aria-valuenow（单位值）。 */
  valueNow: number;
  /** aria 标签前缀，默认「控制点」。 */
  label?: string;
  /** 是否高亮（如正在拖拽）。 */
  active?: boolean;
  onPointerDown: (index: number, e: ReactPointerEvent) => void;
}

/**
 * 可拖控制点的视觉 + 无障碍语义（数学交互件通用原语）。
 * 以 role="slider" 暴露，键盘/读屏可感知；纯展示，拖拽逻辑见 useDraggableValues。
 */
export function DragHandle({
  cx,
  cy,
  index,
  color,
  r = 7,
  axis = 'y',
  valueNow,
  label = '控制点',
  active = false,
  onPointerDown,
}: DragHandleProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={active ? r + 1.5 : r}
      fill={color}
      fillOpacity={active ? 1 : 0.9}
      stroke="#0F172A"
      strokeWidth={1.5}
      style={{ cursor: axis === 'x' ? 'ew-resize' : 'ns-resize' }}
      onPointerDown={(e) => onPointerDown(index, e)}
      role="slider"
      aria-label={`${label} ${index + 1}，当前值 ${valueNow.toFixed(2)}`}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={Number(valueNow.toFixed(2))}
    />
  );
}
