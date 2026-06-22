import { describe, expect, it } from 'vitest';
import { computeDualSpiral } from '@/utils/layout/spiralLayout';
import { EVENTS, MATH_TOOLS, PROOFS, CROSS_LINKS } from '@/data';

describe('computeDualSpiral', () => {
  const layout = computeDualSpiral(
    EVENTS,
    MATH_TOOLS,
    PROOFS,
    CROSS_LINKS,
    'nash',
    { width: 1200, height: 800 },
  );

  it('纳什均衡的史线节点数量与 events 中 nash 数量一致', () => {
    const nashEvents = EVENTS.filter((e) => e.theoryId === 'nash');
    expect(layout.historyNodes).toHaveLength(nashEvents.length);
    expect(layout.historyNodes.length).toBeGreaterThan(0);
  });

  it('纳什均衡的数学线包含角谷、布劳威尔等工具', () => {
    const mathIds = layout.mathNodes.map((n) => n.id);
    expect(mathIds).toContain('kakutani');
    expect(mathIds).toContain('brouwer');
  });

  it('交叉连线从左侧历史节点指向右侧数学工具', () => {
    expect(layout.crossLinks.length).toBeGreaterThan(0);
    for (const link of layout.crossLinks) {
      const h = layout.historyNodes.find((n) => n.id === link.historyId);
      const m = layout.mathNodes.find((n) => n.id === link.mathId);
      expect(h).toBeDefined();
      expect(m).toBeDefined();
      expect(h!.x).toBeLessThan(m!.x); // 历史线在左
    }
  });

  it('边界框覆盖所有节点', () => {
    for (const n of layout.historyNodes) {
      expect(n.y).toBeGreaterThanOrEqual(layout.bounds.minY);
      expect(n.y).toBeLessThanOrEqual(layout.bounds.maxY);
    }
    for (const n of layout.mathNodes) {
      expect(n.y).toBeGreaterThanOrEqual(layout.bounds.minY);
      expect(n.y).toBeLessThanOrEqual(layout.bounds.maxY);
    }
  });

  it('极小极大理论也产生合理布局', () => {
    const l2 = computeDualSpiral(
      EVENTS, MATH_TOOLS, PROOFS, CROSS_LINKS,
      'minimax', { width: 1200, height: 800 },
    );
    expect(l2.historyNodes.length).toBeGreaterThan(0);
  });
});
