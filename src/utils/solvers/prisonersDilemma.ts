/**
 * 囚徒困境求解器（纯函数，claude.md 要求置于纯函数 / Web Worker 中）。
 *
 * 标准收益矩阵（T > R > P > S, 2R > T + S）：
 *             合作    背叛
 *   合作       (R,R)   (S,T)
 *   背叛       (T,S)   (P,P)
 *
 * 纳什均衡：双方背叛（P,P）—— 个体理性导致集体次优。
 */

export type Choice = 'cooperate' | 'defect';

export interface PDConfig {
  /** 背叛-背叛 收益 */
  P: number;
  /** 合作-合作 收益 */
  R: number;
  /** 背叛-合作 收益（背叛方） */
  T: number;
  /** 合作-背叛 收益（合作方） */
  S: number;
}

/** 默认经典囚徒困境参数 */
export const DEFAULT_PD: PDConfig = { P: 1, R: 3, T: 5, S: 0 };

export function payoff(a: Choice, b: Choice, cfg: PDConfig = DEFAULT_PD): [number, number] {
  if (a === 'cooperate' && b === 'cooperate') return [cfg.R, cfg.R];
  if (a === 'cooperate' && b === 'defect') return [cfg.S, cfg.T];
  if (a === 'defect' && b === 'cooperate') return [cfg.T, cfg.S];
  return [cfg.P, cfg.P];
}

export function isNashEquilibrium(a: Choice, b: Choice, cfg: PDConfig = DEFAULT_PD): boolean {
  const [pa, pb] = payoff(a, b, cfg);
  const [pa2, pb2] = payoff('defect', b, cfg);
  const [pa3, pb3] = payoff(a, 'defect', cfg);
  // A 单方面改到 defect 不能改善
  if (a === 'defect' ? pa2 > pa : pa2 >= pa) return false;
  // B 单方面改到 defect 不能改善
  if (b === 'defect' ? pb3 > pb : pb3 >= pb) return false;
  return true;
}

export function getEquilibriumState(
  a: Choice,
  b: Choice,
  cfg: PDConfig = DEFAULT_PD,
): 'nash' | 'not-nash' | 'pareto' {
  const isNE = isNashEquilibrium(a, b, cfg);
  const [pa, pb] = payoff(a, b, cfg);
  const isPareto = pa === cfg.R && pb === cfg.R;
  if (isPareto) return 'pareto';
  if (isNE) return 'nash';
  return 'not-nash';
}
