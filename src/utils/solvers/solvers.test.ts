import { describe, expect, it } from 'vitest';
import {
  payoff,
  isNashEquilibrium,
  getEquilibriumState,
} from '@/utils/solvers/prisonersDilemma';
import {
  expectedPayoffA,
  solveMixedStrategy,
} from '@/utils/solvers/mixedStrategy';
import { solveBackwardInduction, type GameNode } from '@/utils/solvers/backwardInduction';
import {
  evalCurve,
  findFixedPoints,
  clampMonotone,
  findSetValuedFixedPoints,
  type Pt,
} from '@/utils/solvers/fixedPoint';

describe('囚徒困境求解器', () => {
  it('默认收益矩阵：双方合作各得 3', () => {
    expect(payoff('cooperate', 'cooperate')).toEqual([3, 3]);
  });

  it('默认收益矩阵：背叛/合作得 (5,0)', () => {
    expect(payoff('defect', 'cooperate')).toEqual([5, 0]);
  });

  it('默认收益矩阵：双方背叛各得 1', () => {
    expect(payoff('defect', 'defect')).toEqual([1, 1]);
  });

  it('双方背叛是纳什均衡', () => {
    expect(isNashEquilibrium('defect', 'defect')).toBe(true);
  });

  it('双方合作不是纳什均衡', () => {
    expect(isNashEquilibrium('cooperate', 'cooperate')).toBe(false);
  });

  it('双方合作是帕累托最优', () => {
    expect(getEquilibriumState('cooperate', 'cooperate')).toBe('pareto');
  });

  it('双方背叛是纳什均衡（非帕累托）', () => {
    expect(getEquilibriumState('defect', 'defect')).toBe('nash');
  });

  it('非均衡状态', () => {
    expect(getEquilibriumState('cooperate', 'defect')).toBe('not-nash');
  });
});

describe('混合策略求解器', () => {
  it('囚徒困境混合均衡：p*=0, q*=0（纯策略纳什均衡）', () => {
    // A: [R, S, T, P] = [3, 0, 5, 1]
    // B: [R, T, S, P] = [3, 5, 0, 1]
    const result = solveMixedStrategy({
      A: [3, 0, 5, 1],
      B: [3, 5, 0, 1],
    });
    expect(result.pStar).toBeCloseTo(0);
    expect(result.qStar).toBeCloseTo(0);
  });

  it('期望收益计算：双方合作时 A 得 3', () => {
    expect(expectedPayoffA(1, 1, { A: [3, 0, 5, 1], B: [3, 5, 0, 1] })).toBeCloseTo(3);
  });

  it('期望收益计算：双方背叛时 A 得 1', () => {
    expect(expectedPayoffA(0, 0, { A: [3, 0, 5, 1], B: [3, 5, 0, 1] })).toBeCloseTo(1);
  });

  it('猜硬币混合均衡：各 0.5', () => {
    // 猜硬币：行收益矩阵 [1, -1, -1, 1]
    const mp = { A: [1, -1, -1, 1] as [number, number, number, number], B: [-1, 1, 1, -1] as [number, number, number, number] };
    const result = solveMixedStrategy(mp);
    expect(result.pStar).toBeCloseTo(0.5);
    expect(result.qStar).toBeCloseTo(0.5);
  });
});

describe('逆向归纳求解器', () => {
  const simpleTree: GameNode = {
    id: 'root',
    action: '决策',
    children: [
      {
        id: 'left',
        action: '左',
        children: [
          { id: 'left-left', payoff: [0, 0] },
          { id: 'left-right', payoff: [2, 1] },
        ],
      },
      {
        id: 'right',
        action: '右',
        children: [
          { id: 'right-left', payoff: [1, 2] },
          { id: 'right-right', payoff: [3, 3] },
        ],
      },
    ],
  };

  it('求解简单博弈树', () => {
    const result = solveBackwardInduction(simpleTree);
    expect(result.complete).toBe(true);
    expect(result.equilibriumPath.length).toBeGreaterThan(0);
    expect(result.optimalActions.has('root')).toBe(true);
  });

  it('返回路径中的节点 id', () => {
    const result = solveBackwardInduction(simpleTree);
    expect(result.equilibriumPath).toContain('root');
  });
});

describe('不动点求解器', () => {
  it('evalCurve 钳制到 [0,1] 并按分段线性插值', () => {
    const pts: Pt[] = [
      { x: 0, y: 0.2 },
      { x: 1, y: 0.8 },
    ];
    expect(evalCurve(pts, 0.5)).toBeCloseTo(0.5);
    // 越界取最近端点
    expect(evalCurve(pts, -1)).toBeCloseTo(0.2);
    expect(evalCurve(pts, 2)).toBeCloseTo(0.8);
    // 结果钳制
    expect(evalCurve([{ x: 0, y: 5 }, { x: 1, y: 5 }], 0.5)).toBe(1);
  });

  it('findFixedPoints：单次穿越对角线 → 恰 1 个不动点', () => {
    // f(0)=0.8（在对角线上方），f(1)=0.2（下方），单调下降只穿一次
    const fps = findFixedPoints([
      { x: 0, y: 0.8 },
      { x: 1, y: 0.2 },
    ]);
    expect(fps).toHaveLength(1);
    expect(fps[0]).toBeCloseTo(0.5, 2);
  });

  it('findFixedPoints：恒等映射返回单一代表解（不爆炸成上百个）', () => {
    const fps = findFixedPoints([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
    expect(fps).toHaveLength(1);
  });

  it('findFixedPoints：曲线始终在对角线上方 → 仍有边界不动点（连续自映射必有解）', () => {
    // f(0)=0 是不动点；其余在上方
    const fps = findFixedPoints([
      { x: 0, y: 0 },
      { x: 1, y: 0.5 },
    ]);
    expect(fps.length).toBeGreaterThanOrEqual(1);
  });

  it('clampMonotone：输出非减且钳制 [0,1]', () => {
    const out = clampMonotone([
      { x: 0, y: 0.5 },
      { x: 0.5, y: 0.3 },
      { x: 1, y: 1.4 },
    ]);
    expect(out.map((p) => p.y)).toEqual([0.5, 0.5, 1]);
    for (let i = 1; i < out.length; i++) {
      expect(out[i].y).toBeGreaterThanOrEqual(out[i - 1].y);
    }
  });

  it('findSetValuedFixedPoints：带跨过对角线 → 返回相交区间', () => {
    const lower: Pt[] = [
      { x: 0, y: 0.6 },
      { x: 1, y: 0.1 },
    ];
    const upper: Pt[] = [
      { x: 0, y: 0.9 },
      { x: 1, y: 0.4 },
    ];
    const intervals = findSetValuedFixedPoints(lower, upper);
    expect(intervals.length).toBeGreaterThanOrEqual(1);
    const iv = intervals[0];
    expect(iv.end).toBeGreaterThanOrEqual(iv.start);
  });
});
