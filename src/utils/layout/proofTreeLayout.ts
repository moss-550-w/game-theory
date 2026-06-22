import type { ProofBranch, MathTool, TheoryId } from '@/types';

/**
 * 为指定理论筛选相关证明（按 conclusionId 前缀匹配）。
 */
export function getProofsForTheory(
  proofs: ProofBranch[],
  tools: MathTool[],
  theoryId: TheoryId,
): { branch: ProofBranch; tool: MathTool }[] {
  const abbr = theoryId.split('-').slice(0, 2).join('-');
  const toolMap = new Map(tools.map((t) => [t.id, t]));
  return proofs
    .filter((p) => p.conclusionId.startsWith(abbr))
    .map((p) => ({ branch: p, tool: toolMap.get(p.toolId)! }))
    .filter((x) => x.tool);
}
