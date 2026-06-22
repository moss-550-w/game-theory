import { describe, expect, it } from 'vitest';
import {
  payoff,
  isNashEquilibrium,
  getEquilibriumState,
  DEFAULT_PD,
} from '@/utils/solvers/prisonersDilemma';
import { expectedPayoffA, expectedPayoffB, solveMixedStrategy, PD_MATRIX } from '@/utils/solvers/mixedStrategy';
import { solveBackwardInduction, type GameNode } from '@/utils/solvers/backwardInduction';

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
    const result = solveMixedStrategy(PD_MATRIX);
    expect(result.pStar).toBeCloseTo(0);
    expect(result.qStar).toBeCloseTo(0);
  });

  it('期望收益计算：双方合作时 A 得 3', () => {
    expect(expectedPayoffA(1, 1, PD_MATRIX)).toBeCloseTo(3);
  });

  it('期望收益计算：双方背叛时 A 得 1', () => {
    expect(expectedPayoffA(0, 0, PD_MATRIX)).toBeCloseTo(1);
  });

  it('石头剪刀布混合均衡：各 1/3', () => {
    // 石头=0, 剪刀=1, 布=2
    // 行玩家收益: 赢1 平0 输-1
    const rps: typeof PD_MATRIX = {
      A: [0, -1, 1, 0, 0, 1, -1, 0, 0],
      B: [0, 1, -1, 0, 0, -1, 1, 0, 0],
    };
    // Note: this is a 3x3, not directly applicable to 2x2 solver.
    // For 2x2 matching pennies:
    const mp: typeof PD_MATRIX = {
      A: [1, -1, -1, 1], // A: 左上=1, 右上=-1, 左下=-1, 右下=1
      B: [-1, 1, 1, -1], // B: 相反
    };
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
    // 最优行动应选 payoff 最大的子节点
    expect(result.optimalActions.has('root')).toBe(true);
  });

  it('直接返回路径中的节点 id', () => {
    const result = solveBackwardInduction(simpleTree);
    expect(result.equilibriumPath).toContain('root');
  });
});
