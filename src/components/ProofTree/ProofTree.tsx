import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROOFS, MATH_TOOLS, CROSS_LINKS } from '@/data';
import { getProofsForTheory } from '@/utils/layout/proofTreeLayout';
import { THEORY_COLOR } from '@/utils/theoryColor';
import type { ProofBranch, TheoryId, MathLayer } from '@/types';

const LAYER_LABEL: Record<MathLayer, string> = {
  foundation: '底层基础',
  'core-theorem': '核心定理',
  application: '顶层应用',
  refinement: '精炼',
};

interface ProofTreeProps {
  theoryId: TheoryId;
}

/**
 * 多分支证明树（design.md §3.3 / plan.md §M5）。
 * 以「结论 → 多证明路径」的根-叶结构呈现，
 * 每分支标注适用条件与优劣，多分支平等呈现（不暗示唯一标准证明）。
 */
export function ProofTree({ theoryId }: ProofTreeProps) {
  const entries = getProofsForTheory(PROOFS, MATH_TOOLS, theoryId);
  const themeColor = THEORY_COLOR[theoryId];

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        该理论暂无录入证明路径（可由专家后续补充）。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
        <span className="text-sm font-medium text-slate-300">证明路径</span>
        <span className="text-xs text-slate-500">（{entries.length} 种等权路径）</span>
      </div>

      {entries.map(({ branch, tool }) => (
        <ProofBranch
          key={branch.id}
          branch={branch}
          tool={tool}
          themeColor={themeColor}
        />
      ))}
    </div>
  );
}

interface ProofBranchProps {
  branch: ProofBranch;
  tool: { name: string; layer: MathLayer; description: string };
  themeColor: string;
}

function ProofBranch({ branch, tool, themeColor }: ProofBranchProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: themeColor }}
    >
      {/* 头部：可点击展开 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-lg transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
          <span className="font-medium text-slate-200">{tool.name}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
            {LAYER_LABEL[tool.layer]}
          </span>
        </div>
        <span className="text-xs text-slate-500">点击{expanded ? '收起' : '展开'}</span>
      </button>

      {/* 展开内容 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* 适用条件 */}
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  适用条件
                </h4>
                <p className="mt-1 text-sm text-slate-300">{branch.applicability}</p>
              </div>

              {/* 优劣 */}
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  优劣
                </h4>
                <p className="mt-1 text-sm text-slate-300">{branch.prosCons}</p>
              </div>

              {/* 证明概要 */}
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  证明概要
                </h4>
                <p className="mt-1 text-sm text-slate-300">{branch.summary}</p>
              </div>

              {/* 类比（可选） */}
              {branch.analogy && (
                <div className="rounded-lg bg-white/5 p-3">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    生活化类比
                  </h4>
                  <p className="mt-1 text-sm italic text-slate-400">{branch.analogy}</p>
                </div>
              )}

              {/* 关联 crosslink 提示 */}
              {(() => {
                const links = CROSS_LINKS.filter(
                  (cl) => cl.mathToolId === branch.toolId,
                );
                if (links.length === 0) return null;
                return (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      应用历程
                    </h4>
                    <ul className="mt-1 space-y-1">
                      {links.map((cl) => (
                        <li key={`${cl.historyNodeId}~${cl.mathToolId}`} className="text-xs text-slate-400">
                          · {cl.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
