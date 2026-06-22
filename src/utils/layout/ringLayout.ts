/**
 * 环绕层（时间环 / 应用环）节点布局（纯函数，design.md §2.3）。
 * 将条目沿以 (cx, cy) 为心、radius 为半径的圆弧等角分布。
 * 默认从正上方（-90°）顺时针铺开；时间环按年份排序后取序数位置（非线性时间轴）。
 */

export interface RingItem {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
}

export interface RingNode extends RingItem {
  angleDeg: number;
  x: number;
  y: number;
}

export interface RingLayoutOptions {
  cx: number;
  cy: number;
  radius: number;
  /** 起始角（度，0=正右，-90=正上） */
  startDeg?: number;
  /** 总跨角（度），默认 360 整圈 */
  sweepDeg?: number;
}

export function computeRingNodes(
  items: RingItem[],
  opts: RingLayoutOptions,
): RingNode[] {
  const { cx, cy, radius } = opts;
  const startDeg = opts.startDeg ?? -90;
  const sweepDeg = opts.sweepDeg ?? 360;
  const n = items.length;
  if (n === 0) return [];

  // 整圈时用 n 等分（首尾不重叠）；非整圈时用 n-1 等分铺满两端
  const isFullCircle = Math.abs(sweepDeg) >= 360 - 1e-6;
  const step = isFullCircle ? sweepDeg / n : sweepDeg / Math.max(1, n - 1);

  return items.map((item, i) => {
    const angleDeg = startDeg + step * i;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      ...item,
      angleDeg,
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  });
}
