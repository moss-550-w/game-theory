import { describe, expect, it } from 'vitest';
import { computeQuadrantLayout } from '@/utils/layout/quadrantLayout';
import { computeRelationGeometry } from '@/utils/layout/relationLayout';
import { RELATIONS } from '@/data';

describe('computeRelationGeometry', () => {
  const { boxes } = computeQuadrantLayout({ width: 1000, height: 800 });
  const geos = computeRelationGeometry(RELATIONS, boxes);

  it('为每条关系生成几何', () => {
    expect(geos).toHaveLength(RELATIONS.length);
  });

  it('极小极大→纳什为水平箭头（同行）', () => {
    const g = geos.find((g) => g.key === 'minimax->nash')!;
    expect(g.y1).toBeCloseTo(g.y2);
    expect(g.x2).toBeGreaterThan(g.x1);
    expect(g.dashed).toBe(false);
  });

  it('纳什→逆向归纳为垂直箭头（同列、向上）', () => {
    const g = geos.find((g) => g.key === 'nash->backward-induction')!;
    expect(g.x1).toBeCloseTo(g.x2);
    expect(g.y2).toBeLessThan(g.y1);
  });

  it('融合关系为双向虚线', () => {
    const g = geos.find((g) => g.key === 'backward-induction->bayesian')!;
    expect(g.dashed).toBe(true);
    expect(g.doubleHeaded).toBe(true);
  });
});
