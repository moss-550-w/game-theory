import { z } from 'zod';

/**
 * 知识库 zod schema —— 类型的单一来源（plan.md §4.2）。
 * 所有 TS 类型经 z.infer 派生（见 src/types/index.ts 的再导出）。
 * 同时承担运行时校验与跨文件引用完整性检查。
 */

export const TheoryIdSchema = z.enum([
  'minimax',
  'nash',
  'backward-induction',
  'bayesian',
]);

export const QuadrantSchema = z.enum([
  'bottom-left',
  'bottom-right',
  'top-right',
  'top-left',
]);

export const TagSchema = z.enum([
  'cooperative',
  'non-cooperative',
  'static',
  'dynamic',
  'complete-info',
  'incomplete-info',
  'zero-sum',
  'non-zero-sum',
]);

export const TheorySchema = z.object({
  id: TheoryIdSchema,
  name: z.string().min(1),
  quadrant: QuadrantSchema,
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '需为 #RRGGBB 色值'),
  oneLineDef: z.string().min(1),
  coreAssumptions: z.array(z.string().min(1)).min(1),
  equilibriumCondition: z.string().min(1),
  tags: z.array(TagSchema).min(1),
  scene: z.string().min(1),
});

export const HistoryRoleSchema = z.enum([
  'precursor',
  'proposal',
  'refinement',
  'extension',
]);

export const HistoryNodeSchema = z.object({
  id: z.string().min(1),
  theoryId: TheoryIdSchema,
  role: HistoryRoleSchema,
  year: z.number().int(),
  title: z.string().min(1),
  contributor: z.string().min(1),
  contribution: z.string().min(1),
});

export const MathLayerSchema = z.enum([
  'foundation',
  'core-theorem',
  'application',
  'refinement',
]);

export const MathToolSchema = z.object({
  id: z.string().min(1),
  layer: MathLayerSchema,
  name: z.string().min(1),
  description: z.string().min(1),
});

export const ProofBranchSchema = z.object({
  id: z.string().min(1),
  conclusionId: z.string().min(1),
  toolId: z.string().min(1),
  applicability: z.string().min(1),
  prosCons: z.string().min(1),
  summary: z.string().min(1),
  analogy: z.string().optional(),
  children: z.array(z.string().min(1)).optional(),
});

export const RelationKindSchema = z.enum([
  'generalization',
  'refinement',
  'transformation',
  'fusion',
]);

export const RelationSchema = z.object({
  from: TheoryIdSchema,
  to: TheoryIdSchema,
  kind: RelationKindSchema,
  style: z.enum(['solid', 'dashed']),
  label: z.string().min(1),
  year: z.number().int(),
  author: z.string().min(1),
});

export const CrossLinkSchema = z.object({
  historyNodeId: z.string().min(1),
  mathToolId: z.string().min(1),
  label: z.string().min(1),
});

export const ApplicationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relatedTheories: z.array(TheoryIdSchema).min(1),
  milestones: z
    .array(z.object({ year: z.number().int(), title: z.string().min(1) }))
    .min(1),
});

/** 完整知识库的形状（各文件解析后的聚合）。 */
export const KnowledgeBaseSchema = z.object({
  theories: z.array(TheorySchema).min(1),
  events: z.array(HistoryNodeSchema),
  math: z.array(MathToolSchema),
  proofs: z.array(ProofBranchSchema),
  relations: z.array(RelationSchema),
  crosslinks: z.array(CrossLinkSchema),
  applications: z.array(ApplicationSchema),
});

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;

export interface IntegrityError {
  entity: string;
  id: string;
  field: string;
  message: string;
}

/**
 * 引用完整性校验（断链检测）。
 * 在 zod 形状校验通过后调用，检查跨文件 id 引用是否可解析。
 */
export function checkIntegrity(kb: KnowledgeBase): IntegrityError[] {
  const errors: IntegrityError[] = [];

  const theoryIds = new Set(kb.theories.map((t) => t.id));
  const eventIds = new Set(kb.events.map((e) => e.id));
  const mathIds = new Set(kb.math.map((m) => m.id));
  const proofIds = new Set(kb.proofs.map((p) => p.id));

  const dup = <T,>(arr: T[], key: (x: T) => string, entity: string) => {
    const seen = new Set<string>();
    for (const x of arr) {
      const k = key(x);
      if (seen.has(k)) {
        errors.push({ entity, id: k, field: 'id', message: '重复的 id' });
      }
      seen.add(k);
    }
  };
  dup(kb.theories, (t) => t.id, 'theory');
  dup(kb.events, (e) => e.id, 'event');
  dup(kb.math, (m) => m.id, 'math');
  dup(kb.proofs, (p) => p.id, 'proof');

  for (const e of kb.events) {
    if (!theoryIds.has(e.theoryId)) {
      errors.push({
        entity: 'event',
        id: e.id,
        field: 'theoryId',
        message: `引用了不存在的理论 "${e.theoryId}"`,
      });
    }
  }

  for (const r of kb.relations) {
    for (const f of ['from', 'to'] as const) {
      if (!theoryIds.has(r[f])) {
        errors.push({
          entity: 'relation',
          id: `${r.from}->${r.to}`,
          field: f,
          message: `引用了不存在的理论 "${r[f]}"`,
        });
      }
    }
  }

  for (const p of kb.proofs) {
    if (!mathIds.has(p.toolId)) {
      errors.push({
        entity: 'proof',
        id: p.id,
        field: 'toolId',
        message: `引用了不存在的数学工具 "${p.toolId}"`,
      });
    }
    for (const c of p.children ?? []) {
      if (!proofIds.has(c)) {
        errors.push({
          entity: 'proof',
          id: p.id,
          field: 'children',
          message: `引用了不存在的子证明 "${c}"`,
        });
      }
    }
  }

  for (const l of kb.crosslinks) {
    if (!eventIds.has(l.historyNodeId)) {
      errors.push({
        entity: 'crosslink',
        id: `${l.historyNodeId}~${l.mathToolId}`,
        field: 'historyNodeId',
        message: `引用了不存在的历史节点 "${l.historyNodeId}"`,
      });
    }
    if (!mathIds.has(l.mathToolId)) {
      errors.push({
        entity: 'crosslink',
        id: `${l.historyNodeId}~${l.mathToolId}`,
        field: 'mathToolId',
        message: `引用了不存在的数学工具 "${l.mathToolId}"`,
      });
    }
  }

  for (const a of kb.applications) {
    for (const t of a.relatedTheories) {
      if (!theoryIds.has(t)) {
        errors.push({
          entity: 'application',
          id: a.id,
          field: 'relatedTheories',
          message: `引用了不存在的理论 "${t}"`,
        });
      }
    }
  }

  return errors;
}

/**
 * 一站式校验：zod 形状校验 + 引用完整性。
 * 失败抛出聚合错误信息，供加载器与 CI 脚本共用。
 */
export function validateKnowledgeBase(input: {
  theories: unknown;
  events: unknown;
  math: unknown;
  proofs: unknown;
  relations: unknown;
  crosslinks: unknown;
  applications: unknown;
}): KnowledgeBase {
  const kb = KnowledgeBaseSchema.parse(input);
  const errors = checkIntegrity(kb);
  if (errors.length > 0) {
    const lines = errors.map(
      (e) => `  [${e.entity}] ${e.id} · ${e.field}: ${e.message}`,
    );
    throw new Error(`知识库引用完整性校验失败（${errors.length} 处）：\n${lines.join('\n')}`);
  }
  return kb;
}
