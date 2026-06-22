/**
 * 混合策略求解器（纯函数，claude.md 要求）。
 *
 * 给定 2×2 收益矩阵，计算：
 * - 双方的期望收益曲线 E_A(p, q) 与 E_B(p, q)
 * - 纳什均衡混合策略（极小极大点）
 */

export interface PayoffMatrix {
  /** A 收益矩阵 [A选上/B选上, A选上/B选下, A选下/B选上, A选下/B选下] */
  A: [number, number, number, number];
  /** B 收益矩阵（同上顺序） */
  B: [number, number, number, number];
}

export interface MixedResult {
  /** A 在混合策略均衡下选上策的概率 */
  pStar: number;
  /** B 在混合策略均衡下选上策的概率 */
  qStar: number;
  /** 均衡时双方的期望收益 */
  equilibriumPayoff: [number, number];
}

/**
 * 计算 A 在给定 B 混合概率 q 下的期望收益（选上策）。
 */
export function expectedPayoffA(p: number, q: number, m: PayoffMatrix): number {
  return p * (q * m.A[0] + (1 - q) * m.A[1]) + (1 - p) * (q * m.A[2] + (1 - q) * m.A[3]);
}

/**
 * 计算 B 在给定 A 混合概率 p 下的期望收益（选上策）。
 */
export function expectedPayoffB(p: number, q: number, m: PayoffMatrix): number {
  return q * (p * m.B[0] + (1 - p) * m.B[2]) + (1 - q) * (p * m.B[1] + (1 - p) * m.B[3]);
}

/**
 * 求解 2×2 博弈的混合策略纳什均衡（解析解）。
 * A 选上策概率 p*，B 选上策概率 q*。
 */
export function solveMixedStrategy(m: PayoffMatrix): MixedResult {
  // A 的混合策略：使 B 无差异
  // B 选上 = q, 选下 = 1-q
  // A 期望收益选上: q*m.A[0] + (1-q)*m.A[1]
  // A 期望收益选下: q*m.A[2] + (1-q)*m.A[3]
  // 令两者相等：q*(m.A[0]-m.A[2]) + (1-q)*(m.A[1]-m.A[3]) = 0
  const denomA = m.A[0] - m.A[2] - m.A[1] + m.A[3];
  const qStar = denomA === 0 ? 0.5 : (m.A[3] - m.A[1]) / denomA;
  const pClamped = Math.max(0, Math.min(1, qStar));

  // B 的混合策略：使 A 无差异
  const denomB = m.B[0] - m.B[1] - m.B[2] + m.B[3];
  const pStar = denomB === 0 ? 0.5 : (m.B[3] - m.B[2]) / denomB;
  const qClamped = Math.max(0, Math.min(1, pStar));

  const eqPayoffA = expectedPayoffA(pClamped, qClamped, m);
  const eqPayoffB = expectedPayoffB(pClamped, qClamped, m);

  return {
    pStar: pClamped,
    qStar: qClamped,
    equilibriumPayoff: [eqPayoffA, eqPayoffB],
  };
}

/** 默认囚徒困境收益矩阵 */
export const PD_MATRIX: PayoffMatrix = {
  A: [3, 0, 5, 1], // 合作-合作, 合作-背叛, 背叛-合作, 背叛-背叛
  B: [3, 5, 0, 1],
};
