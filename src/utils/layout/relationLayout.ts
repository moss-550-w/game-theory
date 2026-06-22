import type { Relation, TheoryId } from '@/types';
import type { QuadrantBox } from './quadrantLayout';

/**
 * 理论关系箭头的几何计算（纯函数，design.md §2.2）。
 * 根据两支柱象限的相对位置，选择「面对面」的连接点，使箭头走在象限交界/间隙处，
 * 避开象限中心的文字。融合关系（fusion）渲染为双向虚线。
 */

export interface RelationGeometry {
  key: string;
  from: TheoryId;
  to: TheoryId;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  label: string;
  dashed: boolean;
  doubleHeaded: boolean;
}

const sign = (n: number): -1 | 0 | 1 => (n > 0 ? 1 : n < 0 ? -1 : 0);

/** 对角连接时，从象限内角缩进的距离 */
const DIAG_INSET = 30;

function anchorOf(box: QuadrantBox, dx: -1 | 0 | 1, dy: -1 | 0 | 1) {
  if (dy === 0) {
    // 同一行：取左/右边中点
    return { x: dx > 0 ? box.x + box.width : box.x, y: box.cy };
  }
  if (dx === 0) {
    // 同一列：取上/下边中点
    return { x: box.cx, y: dy > 0 ? box.y + box.height : box.y };
  }
  // 对角：取朝向对方的内角
  return {
    x: (dx > 0 ? box.x + box.width : box.x) - dx * DIAG_INSET,
    y: (dy > 0 ? box.y + box.height : box.y) - dy * DIAG_INSET,
  };
}

export function computeRelationGeometry(
  relations: Relation[],
  boxes: QuadrantBox[],
): RelationGeometry[] {
  const boxByTheory = new Map<TheoryId, QuadrantBox>();
  for (const b of boxes) boxByTheory.set(b.theoryId, b);

  const out: RelationGeometry[] = [];
  for (const r of relations) {
    const a = boxByTheory.get(r.from);
    const b = boxByTheory.get(r.to);
    if (!a || !b) continue;

    const dx = sign(b.cx - a.cx);
    const dy = sign(b.cy - a.cy);
    const start = anchorOf(a, dx, dy);
    const end = anchorOf(b, (-dx || 0) as -1 | 0 | 1, (-dy || 0) as -1 | 0 | 1);

    out.push({
      key: `${r.from}->${r.to}`,
      from: r.from,
      to: r.to,
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      labelX: (start.x + end.x) / 2,
      labelY: (start.y + end.y) / 2,
      label: r.label,
      dashed: r.style === 'dashed',
      doubleHeaded: r.kind === 'fusion',
    });
  }
  return out;
}
