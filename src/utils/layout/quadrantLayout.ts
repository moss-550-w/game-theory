import type { Quadrant, TheoryId } from '@/types';

/**
 * 四象限主视图布局（纯函数，plan.md §M2 / design.md §2.1）。
 *
 * 坐标语义：
 *   x 轴：零和（左）→ 非零和（右）
 *   y 轴：静态/完全信息（下）→ 动态/不完全信息（上）
 *
 * 注意：SVG 屏幕坐标 y 向下增长，故「下方象限」的 row=1、「上方象限」的 row=0。
 */

export interface QuadrantBox {
  quadrant: Quadrant;
  theoryId: TheoryId;
  /** 矩形左上角与尺寸（SVG 坐标） */
  x: number;
  y: number;
  width: number;
  height: number;
  /** 支柱锚点（矩形中心） */
  cx: number;
  cy: number;
}

export interface AxisLabel {
  text: string;
  x: number;
  y: number;
  /** 文本锚定方式，便于贴边对齐 */
  anchor: 'start' | 'middle' | 'end';
}

export interface QuadrantLayout {
  boxes: QuadrantBox[];
  axes: AxisLabel[];
  /** 绘图区边界，供边界渐变/分隔线使用 */
  plot: { x: number; y: number; width: number; height: number };
  /** 两象限之间的间隙 */
  gap: number;
}

export interface QuadrantLayoutOptions {
  width: number;
  height: number;
  /** 绘图区四周留白（给坐标轴标签）。被 paddingX/paddingY 覆盖。 */
  padding?: number;
  /** 水平留白（用于为环绕层让出空间，居中正方形绘图区） */
  paddingX?: number;
  /** 垂直留白 */
  paddingY?: number;
  /** 象限间隙 */
  gap?: number;
}

/** 象限 → 网格列行（row 以屏幕坐标计，0 在上）。 */
const GRID: Record<Quadrant, { col: 0 | 1; row: 0 | 1 }> = {
  'top-left': { col: 0, row: 0 },
  'top-right': { col: 1, row: 0 },
  'bottom-left': { col: 0, row: 1 },
  'bottom-right': { col: 1, row: 1 },
};

/** 象限 → 锚定的理论支柱（design.md §2.1）。 */
const QUADRANT_THEORY: Record<Quadrant, TheoryId> = {
  'bottom-left': 'minimax',
  'bottom-right': 'nash',
  'top-right': 'backward-induction',
  'top-left': 'bayesian',
};

const ORDER: Quadrant[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function computeQuadrantLayout(opts: QuadrantLayoutOptions): QuadrantLayout {
  const { width, height } = opts;
  const padding = opts.padding ?? 64;
  const paddingX = opts.paddingX ?? padding;
  const paddingY = opts.paddingY ?? padding;
  const gap = opts.gap ?? 16;

  const plot = {
    x: paddingX,
    y: paddingY,
    width: Math.max(0, width - paddingX * 2),
    height: Math.max(0, height - paddingY * 2),
  };

  const cellW = (plot.width - gap) / 2;
  const cellH = (plot.height - gap) / 2;

  const boxes: QuadrantBox[] = ORDER.map((quadrant) => {
    const { col, row } = GRID[quadrant];
    const x = plot.x + col * (cellW + gap);
    const y = plot.y + row * (cellH + gap);
    return {
      quadrant,
      theoryId: QUADRANT_THEORY[quadrant],
      x,
      y,
      width: cellW,
      height: cellH,
      cx: x + cellW / 2,
      cy: y + cellH / 2,
    };
  });

  const midX = plot.x + plot.width / 2;
  const midY = plot.y + plot.height / 2;
  const belowPlot = plot.y + plot.height + 24;
  const leftOfPlot = plot.x - 12;
  const axes: AxisLabel[] = [
    { text: '零和', x: plot.x, y: belowPlot, anchor: 'start' },
    { text: '对抗 ↔ 合作', x: midX, y: belowPlot, anchor: 'middle' },
    { text: '非零和', x: plot.x + plot.width, y: belowPlot, anchor: 'end' },
    { text: '动态 · 不完全信息', x: leftOfPlot, y: plot.y + 6, anchor: 'end' },
    { text: '信息与时序', x: leftOfPlot, y: midY, anchor: 'end' },
    { text: '静态 · 完全信息', x: leftOfPlot, y: plot.y + plot.height - 2, anchor: 'end' },
  ];

  return { boxes, axes, plot, gap };
}

export { QUADRANT_THEORY };
