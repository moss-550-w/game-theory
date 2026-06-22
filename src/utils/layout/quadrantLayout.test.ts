import { describe, expect, it } from 'vitest';
import { computeQuadrantLayout } from '@/utils/layout/quadrantLayout';
import type { Quadrant } from '@/types';

describe('computeQuadrantLayout', () => {
  const layout = computeQuadrantLayout({ width: 1000, height: 800, padding: 64, gap: 16 });

  it('返回四个象限盒', () => {
    expect(layout.boxes).toHaveLength(4);
    const qs = layout.boxes.map((b) => b.quadrant).sort();
    expect(qs).toEqual(
      (['bottom-left', 'bottom-right', 'top-left', 'top-right'] as Quadrant[]).sort(),
    );
  });

  it('象限锚定正确的理论支柱', () => {
    const byQ = Object.fromEntries(layout.boxes.map((b) => [b.quadrant, b.theoryId]));
    expect(byQ['bottom-left']).toBe('minimax');
    expect(byQ['bottom-right']).toBe('nash');
    expect(byQ['top-right']).toBe('backward-induction');
    expect(byQ['top-left']).toBe('bayesian');
  });

  it('上方象限在下方象限之上（屏幕 y 更小）', () => {
    const top = layout.boxes.find((b) => b.quadrant === 'top-left')!;
    const bottom = layout.boxes.find((b) => b.quadrant === 'bottom-left')!;
    expect(top.cy).toBeLessThan(bottom.cy);
  });

  it('右侧象限在左侧象限之右（屏幕 x 更大）', () => {
    const left = layout.boxes.find((b) => b.quadrant === 'bottom-left')!;
    const right = layout.boxes.find((b) => b.quadrant === 'bottom-right')!;
    expect(right.cx).toBeGreaterThan(left.cx);
  });

  it('象限不重叠且填满绘图区（含间隙）', () => {
    const { plot, gap } = layout;
    const cellW = (plot.width - gap) / 2;
    const cellH = (plot.height - gap) / 2;
    for (const b of layout.boxes) {
      expect(b.width).toBeCloseTo(cellW);
      expect(b.height).toBeCloseTo(cellH);
      expect(b.x).toBeGreaterThanOrEqual(plot.x);
      expect(b.y).toBeGreaterThanOrEqual(plot.y);
      expect(b.x + b.width).toBeLessThanOrEqual(plot.x + plot.width + 0.001);
      expect(b.y + b.height).toBeLessThanOrEqual(plot.y + plot.height + 0.001);
    }
  });
});
