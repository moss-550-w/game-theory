/**
 * 全局类型定义（与 plan.md §4.1 对齐）。
 * M0 仅落地核心实体；M1 将补全 zod schema 与运行时校验。
 */

export type TheoryId = 'minimax' | 'nash' | 'backward-induction' | 'bayesian';

export type Quadrant = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';

export type Tag =
  | 'cooperative'
  | 'non-cooperative'
  | 'static'
  | 'dynamic'
  | 'complete-info'
  | 'incomplete-info'
  | 'zero-sum'
  | 'non-zero-sum';

export interface Theory {
  id: TheoryId;
  name: string;
  quadrant: Quadrant;
  /** 主题色（design.md §8.1） */
  themeColor: string;
  /** 一句话定义 */
  oneLineDef: string;
  coreAssumptions: string[];
  equilibriumCondition: string;
  tags: Tag[];
  /** 核心解决场景 */
  scene: string;
}

export type HistoryRole = 'precursor' | 'proposal' | 'refinement' | 'extension';

export interface HistoryNode {
  id: string;
  theoryId: TheoryId;
  role: HistoryRole;
  year: number;
  title: string;
  contributor: string;
  /** 一句话贡献 */
  contribution: string;
}

export type MathLayer = 'foundation' | 'core-theorem' | 'application' | 'refinement';

export interface MathTool {
  id: string;
  layer: MathLayer;
  name: string;
  description: string;
}

export interface ProofBranch {
  id: string;
  /** 所证结论 id（如 nash-existence） */
  conclusionId: string;
  /** 依赖的数学工具 id */
  toolId: string;
  /** 适用条件 */
  applicability: string;
  /** 优劣 */
  prosCons: string;
  /** 证明概要 */
  summary: string;
  /** 生活化类比版（可选） */
  analogy?: string;
  children?: string[];
}

export type RelationKind =
  | 'generalization'
  | 'refinement'
  | 'transformation'
  | 'fusion';

export interface Relation {
  from: TheoryId;
  to: TheoryId;
  kind: RelationKind;
  style: 'solid' | 'dashed';
  /** 如“从零和到非零和的推广” */
  label: string;
  year: number;
  author: string;
}

/** 历史需求 ↔ 数学工具 映射 */
export interface CrossLink {
  historyNodeId: string;
  mathToolId: string;
  label: string;
}

export interface Application {
  id: string;
  name: string;
  /** 一对多 */
  relatedTheories: TheoryId[];
  milestones: { year: number; title: string }[];
}
