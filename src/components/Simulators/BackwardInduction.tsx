import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { solveBackwardInduction, type GameNode, type SolverResult } from '@/utils/solvers/backwardInduction';
import { useViewStore } from '@/store/viewStore';
import { THEORY_COLOR } from '@/utils/theoryColor';

/** 示例博弈树：经典蜈蚣博弈 */
const DEFAULT_TREE: GameNode = {
  id: 'root',
  action: 'A 决策',
  children: [
    {
      id: 'a-stop',
      action: '停止',
      payoff: [2, 1],
    },
    {
      id: 'a-continue',
      action: '继续',
      children: [
        {
          id: 'b-stop',
          action: '停止',
          payoff: [1, 2],
        },
        {
          id: 'b-continue',
          action: '继续',
          children: [
            {
              id: 'c-stop',
              action: '停止',
              payoff: [3, 3],
            },
            {
              id: 'c-continue',
              action: '继续',
              payoff: [0, 0],
            },
          ],
        },
      ],
    },
  ],
};

export function BackwardInductionSimulator() {
  const closeSimulator = useViewStore((s) => s.closeSimulator);
  const themeColor = THEORY_COLOR['backward-induction'];

  const tree = DEFAULT_TREE;
  const result = useMemo(() => solveBackwardInduction(tree), [tree]);

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const totalSteps = result.equilibriumPath.length;

  const handleNext = useCallback(() => {
    if (step >= totalSteps) return;
    const nextId = result.equilibriumPath[step];
    setRevealed((prev) => new Set(prev).add(nextId));
    setStep((s) => s + 1);
  }, [step, totalSteps, result.equilibriumPath]);

  const handleReset = useCallback(() => {
    setRevealed(new Set());
    setStep(0);
    setAutoPlaying(false);
  }, []);

  const handleAutoPlay = useCallback(() => {
    if (autoPlaying) {
      setAutoPlaying(false);
      return;
    }
    setAutoPlaying(true);
    handleNext();
  }, [autoPlaying, handleNext]);

  // Auto-play effect
  if (autoPlaying && step < totalSteps) {
    setTimeout(() => handleNext(), 800);
  } else if (autoPlaying && step >= totalSteps) {
    setAutoPlaying(false);
  }

  const explanations = useMemo(() => {
    const exps: string[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const nodeId = result.equilibriumPath[i];
      const action = result.optimalActions.get(nodeId);
      const isLast = i === totalSteps - 1;
      if (isLast) {
        exps.push(`最终均衡：在 ${nodeId}，收益为 (2, 1)`);
      } else if (action) {
        exps.push(`第 ${i + 1} 步：在 ${nodeId}，最优行动为「${action}」`);
      } else {
        exps.push(`第 ${i + 1} 步：节点 ${nodeId}`);
      }
    }
    return exps;
  }, [result, totalSteps]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: themeColor }}>
            逆向归纳演示器
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            从末端逆推，逐步高亮最优行动，收束到子博弈完美均衡
          </p>
        </div>
        <button
          onClick={closeSimulator}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          ← 返回
        </button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            disabled={step >= totalSteps}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
          >
            下一步 →
          </button>
          <button
            onClick={handleAutoPlay}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              autoPlaying
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white'
            }`}
          >
            {autoPlaying ? '⏸ 暂停' : '▶ 自动'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
          >
            ↺ 重置
          </button>
          <span className="text-xs text-slate-500">
            步骤 {step}/{totalSteps}
          </span>
        </div>

        {step > 0 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-300"
          >
            {explanations[step - 1]}
          </motion.div>
        )}

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-8">
          <GameTree
            node={tree}
            revealed={revealed}
            result={result}
            depth={0}
            player={0}
          />
        </div>

        {step >= totalSteps && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center"
          >
            <p className="text-sm font-medium text-emerald-400">
              子博弈完美均衡：A 停止 → (2, 1)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              通过逆向归纳，从末端最优行动逆推至根节点，排除不可信威胁
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface TreeProps {
  node: GameNode;
  revealed: Set<string>;
  result: SolverResult;
  depth: number;
  player: 0 | 1;
}

function GameTree({ node, revealed, result, depth, player }: TreeProps) {
  const isRevealed = revealed.has(node.id);
  const isLeaf = !node.children || node.children.length === 0;
  const optimalChild = isLeaf ? null : result.optimalActions.get(node.id);
  const isOnPath = isLeaf ? result.equilibriumPath.includes(node.id) : false;

  const playerLabels = ['A', 'B', 'A', 'B'];
  const currentPlayer = playerLabels[player] ?? 'A';

  if (isLeaf) {
    return (
      <div
        className={`rounded-xl border px-4 py-3 transition-all ${
          isRevealed && isOnPath
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <div className="text-xs text-slate-500">叶节点</div>
        <div className="mt-1 text-sm font-medium text-slate-200">
          收益：({node.payoff?.[0] ?? 0}, {node.payoff?.[1] ?? 0})
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-xl border px-4 py-2 transition-all ${
          isRevealed
            ? 'border-white/30 bg-white/10'
            : 'border-white/10 bg-white/5 opacity-50'
        }`}
      >
        <div className="text-xs text-slate-500">
          决策节点 · 玩家 {currentPlayer}
        </div>
        <div className="mt-1 text-sm font-medium text-slate-200">{node.action}</div>
        {isRevealed && optimalChild && (
          <div className="mt-1 text-xs text-emerald-400">
            ✓ 最优：「{optimalChild}」
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {node.children!.map((child) => (
          <div key={child.id} className="flex flex-col items-center">
            <div className="h-6 w-px bg-white/10" />
            <GameTree
              node={child}
              revealed={revealed}
              result={result}
              depth={depth + 1}
              player={player === 0 ? 1 : 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
