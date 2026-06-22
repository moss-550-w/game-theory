/**
 * 全局类型定义。
 * 单一来源：所有实体类型由 src/data/schema.ts 的 zod schema 经 z.infer 派生，
 * 此处仅做再导出，保证「类型 ↔ 运行时校验」不漂移（plan.md §4.2）。
 */
import type { z } from 'zod';
import type {
  TheoryIdSchema,
  QuadrantSchema,
  TagSchema,
  TheorySchema,
  HistoryRoleSchema,
  HistoryNodeSchema,
  MathLayerSchema,
  MathToolSchema,
  ProofBranchSchema,
  RelationKindSchema,
  RelationSchema,
  CrossLinkSchema,
  ApplicationSchema,
} from '@/data/schema';

export type TheoryId = z.infer<typeof TheoryIdSchema>;
export type Quadrant = z.infer<typeof QuadrantSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Theory = z.infer<typeof TheorySchema>;
export type HistoryRole = z.infer<typeof HistoryRoleSchema>;
export type HistoryNode = z.infer<typeof HistoryNodeSchema>;
export type MathLayer = z.infer<typeof MathLayerSchema>;
export type MathTool = z.infer<typeof MathToolSchema>;
export type ProofBranch = z.infer<typeof ProofBranchSchema>;
export type RelationKind = z.infer<typeof RelationKindSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type CrossLink = z.infer<typeof CrossLinkSchema>;
export type Application = z.infer<typeof ApplicationSchema>;

export type { KnowledgeBase } from '@/data/schema';
