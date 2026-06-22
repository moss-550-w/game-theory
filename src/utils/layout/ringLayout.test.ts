import { describe, expect, it } from 'vitest';
import { computeRingNodes, type RingItem } from '@/utils/layout/ringLayout';

const items: RingItem[] = [
  { id: 'a', label: 'A', color: '#fff' },
  { id: 'b', label: 'B', color: '#fff' },
  { id: 'c', label: 'C', color: '#fff' },
  { id: 'd', label: 'D', color: '#fff' },
];

describe('computeRingNodes', () => {
  it('空输入返回空', () => {
    expect(computeRingNodes([], { cx: 0, cy: 0, radius: 10 })).toEqual([]);
  });

  it('所有节点落在半径圆上', () => {
    const nodes = computeRingNodes(items, { cx: 500, cy: 400, radius: 350 });
    for (const node of nodes) {
      const d = Math.hypot(node.x - 500, node.y - 400);
      expect(d).toBeCloseTo(350);
    }
  });

  it('整圈时首节点在正上方（-90°）', () => {
    const nodes = computeRingNodes(items, { cx: 500, cy: 400, radius: 350 });
    expect(nodes[0].x).toBeCloseTo(500);
    expect(nodes[0].y).toBeCloseTo(50);
  });

  it('整圈四节点均匀分布（间隔 90°）', () => {
    const nodes = computeRingNodes(items, { cx: 0, cy: 0, radius: 10 });
    expect(nodes[1].angleDeg - nodes[0].angleDeg).toBeCloseTo(90);
  });

  it('部分弧时铺满首尾两端', () => {
    const nodes = computeRingNodes(items, {
      cx: 0,
      cy: 0,
      radius: 10,
      startDeg: 0,
      sweepDeg: 180,
    });
    expect(nodes[0].angleDeg).toBeCloseTo(0);
    expect(nodes[nodes.length - 1].angleDeg).toBeCloseTo(180);
  });
});
