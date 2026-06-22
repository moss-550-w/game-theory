/**
 * 绘图坐标映射（纯函数）。
 *
 * 把单位坐标系 [0,1]×[0,1]（数学语义，y 向上）映射到 SVG 像素坐标
 * （viewBox 内，y 向下），并提供反向映射供拖拽时把指针位置换算回单位值。
 * 多个数学交互件（不动点、下包络、最优反应交点等）共用同一套换算。
 */

export interface Pt {
  x: number;
  y: number;
}

export interface PlotScale {
  /** viewBox 边长（正方形）。 */
  view: number;
  /** 四周留白。 */
  pad: number;
  /** 绘图区边长 = view - pad*2。 */
  plot: number;
  /** 单位 x → 像素 x。 */
  sx: (u: number) => number;
  /** 单位 y → 像素 y（翻转，y 向上）。 */
  sy: (v: number) => number;
  /** 像素 x → 单位 x（钳制 [0,1]）。 */
  invX: (px: number) => number;
  /** 像素 y → 单位 y（钳制 [0,1]，翻转）。 */
  invY: (py: number) => number;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 构造一个正方形单位绘图区的坐标换算器。 */
export function createPlotScale(view = 300, pad = 34): PlotScale {
  const plot = view - pad * 2;
  return {
    view,
    pad,
    plot,
    sx: (u) => pad + u * plot,
    sy: (v) => pad + (1 - v) * plot,
    invX: (px) => clamp01((px - pad) / plot),
    invY: (py) => clamp01(1 - (py - pad) / plot),
  };
}

/** 把单位坐标点序列转成 SVG 折线 path（M…L…）。 */
export function pointsToPath(points: Pt[], s: PlotScale): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${s.sx(p.x).toFixed(1)} ${s.sy(p.y).toFixed(1)}`)
    .join(' ');
}

/**
 * 把一对上下边界点序列转成闭合「带状」区域 path（用于集值映射填充）。
 * 沿下边界正向、上边界逆向连接后闭合。
 */
export function bandToPath(lower: Pt[], upper: Pt[], s: PlotScale): string {
  if (lower.length === 0 || upper.length === 0) return '';
  const down = lower.map((p, i) => `${i === 0 ? 'M' : 'L'} ${s.sx(p.x).toFixed(1)} ${s.sy(p.y).toFixed(1)}`);
  const up = [...upper]
    .reverse()
    .map((p) => `L ${s.sx(p.x).toFixed(1)} ${s.sy(p.y).toFixed(1)}`);
  return `${down.join(' ')} ${up.join(' ')} Z`;
}
