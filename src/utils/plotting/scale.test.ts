import { describe, expect, it } from 'vitest';
import { createPlotScale, pointsToPath, bandToPath, clamp01 } from '@/utils/plotting/scale';

describe('绘图坐标映射', () => {
  const s = createPlotScale(300, 34); // plot = 232

  it('clamp01 钳制到 [0,1]', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.3)).toBeCloseTo(0.3);
  });

  it('单位坐标映射到绘图区四角', () => {
    expect(s.sx(0)).toBeCloseTo(34);
    expect(s.sx(1)).toBeCloseTo(266);
    // y 翻转：单位 0 在底部（像素大），单位 1 在顶部（像素小）
    expect(s.sy(0)).toBeCloseTo(266);
    expect(s.sy(1)).toBeCloseTo(34);
  });

  it('正反映射互逆（含 y 翻转）', () => {
    expect(s.invX(s.sx(0.4))).toBeCloseTo(0.4);
    expect(s.invY(s.sy(0.7))).toBeCloseTo(0.7);
  });

  it('反映射越界时钳制到 [0,1]', () => {
    expect(s.invX(-100)).toBe(0);
    expect(s.invY(99999)).toBe(0);
    expect(s.invX(99999)).toBe(1);
  });

  it('pointsToPath 生成 M…L… 折线', () => {
    const d = pointsToPath([{ x: 0, y: 0 }, { x: 1, y: 1 }], s);
    expect(d.startsWith('M')).toBe(true);
    expect(d).toContain('L');
  });

  it('bandToPath 闭合（以 Z 结尾）', () => {
    const d = bandToPath([{ x: 0, y: 0.2 }, { x: 1, y: 0.2 }], [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }], s);
    expect(d.endsWith('Z')).toBe(true);
  });

  it('bandToPath 空输入返回空串', () => {
    expect(bandToPath([], [], s)).toBe('');
  });
});
