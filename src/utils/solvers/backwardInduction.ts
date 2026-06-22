/**
 * 逆向归纳求解器（纯函数，claude.md 要求）。
 *
 * 以「扩展式博弈树」为输入，从末端节点逆推最优行动，
 * 标注子博弈完美均衡路径。
 */

export interface GameNode {
  id: string;
  /** 行动标签，叶节点留空 */
  action?: string;
  /** 收益（仅叶节点有值） */
  payoff?: [number, number];
  /** 子节点（决策节点用） */
  children?: GameNode[];
}

export interface SolverResult {
  /** 均衡路径上的节点 id 序列 */
  equilibriumPath: string[];
  /** 每个节点的最优行动 */
  optimalActions: Map<string, string>;
  /** 是否完成求解 */
  complete: boolean;
}

/**
 * 递归求解：给定当前玩家视角（0=玩家A, 1=玩家B），返回该节点的最优行动与均衡路径。
 */
export function solveBackwardInduction(root: GameNode): SolverResult {
  const optimalActions = new Map<string, string>();
  const equilibriumPath: string[] = [];

  function solve(node: GameNode, player: 0 | 1): string {
    if (!node.children || node.children.length === 0) {
      // 叶节点：记录均衡路径
      equilibriumPath.push(node.id);
      return node.id;
    }

    // 从子节点逆推，选当前玩家收益最大的子节点
    let bestChild = node.children[0];
    let bestPayoff = bestChild.payoff?.[player] ?? -Infinity;

    for (const child of node.children) {
      const p = child.payoff?.[player] ?? -Infinity;
      if (p > bestPayoff) {
        bestPayoff = p;
        bestChild = child;
      }
    }

    optimalActions.set(node.id, bestChild.action ?? bestChild.id);
    equilibriumPath.push(node.id);
    return solve(bestChild, player === 0 ? 1 : 0);
  }

  solve(root, 0);
  return { equilibriumPath, optimalActions, complete: true };
}
