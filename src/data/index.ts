import theories from './theories.yaml';
import events from './events.yaml';
import math from './math.yaml';
import proofs from './proofs.yaml';
import relations from './relations.yaml';
import crosslinks from './crosslinks.yaml';
import applications from './applications.yaml';
import { validateKnowledgeBase, type KnowledgeBase } from './schema';

/**
 * 知识库加载器（plan.md §4.2）。
 * 通过 @rollup/plugin-yaml 在构建期把 YAML 解析为对象，
 * 运行期再经 zod 形状校验 + 引用完整性检查，得到强类型知识库。
 * 任一文件断链或形状不符都会在模块加载时抛出，尽早暴露问题。
 */
export const knowledgeBase: KnowledgeBase = validateKnowledgeBase({
  theories,
  events,
  math,
  proofs,
  relations,
  crosslinks,
  applications,
});

export const THEORIES = knowledgeBase.theories;
export const EVENTS = knowledgeBase.events;
export const MATH_TOOLS = knowledgeBase.math;
export const PROOFS = knowledgeBase.proofs;
export const RELATIONS = knowledgeBase.relations;
export const CROSS_LINKS = knowledgeBase.crosslinks;
export const APPLICATIONS = knowledgeBase.applications;
