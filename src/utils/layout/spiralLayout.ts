import type {
  HistoryNode,
  MathTool,
  ProofBranch,
  CrossLink,
  TheoryId,
  MathLayer,
} from '@/types';

/**
 * 双重螺旋布局（纯函数，design.md §3.1 / plan.md §M4）。
 *
 * 历史线（左）按年份非等比纵轴排布节点；
 * 数学线（右）按数学层次分层纵轴排布；
 * 交叉连线从历史节点指向其关联的数学工具。
 *
 * 纵轴均用「等步长 + 年份/层标签」的简化方案，
 * 避免非线性映射引入的额外复杂度（可按需升级为对数/密度感知）。
 */

/** 数学层顺序（从底到顶）。 */
export const LAYER_ORDER: MathLayer[] = [
  'foundation',
  'core-theorem',
  'application',
  'refinement',
];

export interface HistoryTrackNode {
  id: string;
  title: string;
  year: number;
  role: string;
  contributor: string;
  x: number;
  y: number;
}

export interface MathTrackNode {
  id: string;
  name: string;
  layer: MathLayer;
  description: string;
  x: number;
  y: number;
}

export interface CrossLinkArc {
  historyId: string;
  mathId: string;
  /** 贝塞尔控制点，使弧线从左侧跨到右侧 */
  cpX: number;
  cpY: number;
}

export interface DualSpiralLayout {
  historyNodes: HistoryTrackNode[];
  mathNodes: MathTrackNode[];
  crossLinks: CrossLinkArc[];
  /** 绘图区域（用于居中/边界） */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface DualSpiralOptions {
  width: number;
  height: number;
  paddingX?: number;
  paddingY?: number;
}

export function computeDualSpiral(
  events: HistoryNode[],
  mathTools: MathTool[],
  proofs: ProofBranch[],
  crossLinks: CrossLink[],
  theoryId: TheoryId,
  opts: DualSpiralOptions,
): DualSpiralLayout {
  const { width, height } = opts;
  const padX = opts.paddingX ?? 80;
  const padY = opts.paddingY ?? 60;

  // ── 筛选当前理论的节点 ──
  const theoryEvents = events
    .filter((e) => e.theoryId === theoryId)
    .sort((a, b) => a.year - b.year);

  // 收集该理论涉及的数学工具（通过 proof conclusionId 前缀匹配）
  const usedToolIds = new Set<string>();
  const abbr = theoryId.split('-').slice(0, 2).join('-'); // nash / minimax / backward / bayesian
  for (const p of proofs) {
    if (p.conclusionId.startsWith(abbr)) usedToolIds.add(p.toolId);
  }
  // 从 crosslinks 补充（历史节点→数学工具）
  for (const cl of crossLinks) {
    const ev = events.find((e) => e.id === cl.historyNodeId);
    if (ev?.theoryId === theoryId) usedToolIds.add(cl.mathToolId);
  }

  const theoryMath = mathTools.filter((m) => usedToolIds.has(m.id));

  // ── 历史线纵轴排布（左列，等步长 + 年份标签） ──
  const leftX = padX + 60;
  const historyStep = theoryEvents.length > 1
    ? (height - padY * 2) / (theoryEvents.length - 1)
    : 0;
  const historyBaseY = theoryEvents.length === 1 ? height / 2 : padY;

  const historyNodes: HistoryTrackNode[] = theoryEvents.map((e, i) => ({
    id: e.id,
    title: e.title,
    year: e.year,
    role: e.role,
    contributor: e.contributor,
    x: leftX,
    y: historyBaseY + i * historyStep,
  }));

  // ── 数学线纵轴排布（右列，按 layer 分层 + 同层等距） ──
  const rightX = width - padX - 60;
  const layerGroups = new Map<MathLayer, MathTool[]>();
  for (const m of theoryMath) {
    const list = layerGroups.get(m.layer) ?? [];
    list.push(m);
    layerGroups.set(m.layer, list);
  }

  const mathNodes: MathTrackNode[] = [];
  let mathY = padY;
  for (const layer of LAYER_ORDER) {
    const items = layerGroups.get(layer) ?? [];
    if (items.length === 0) continue;
    const layerH = (height - padY * 2) / Math.max(1, LAYER_ORDER.filter((l) => layerGroups.get(l)?.length).length);
    const layerBaseY = mathY;
    for (let i = 0; i < items.length; i++) {
      const step = items.length > 1 ? layerH / (items.length - 1) : 0;
      const baseY = items.length === 1 ? height / 2 : layerBaseY;
      mathNodes.push({
        ...items[i],
        x: rightX,
        y: baseY + i * step,
      });
    }
    mathY += layerH;
  }

  // Re-sort math nodes by their Y position to get top-to-bottom order
  mathNodes.sort((a, b) => a.y - b.y);

  // ── 交叉连线 ──
  const hMap = new Map(historyNodes.map((n) => [n.id, n]));
  const mMap = new Map(mathNodes.map((n) => [n.id, n]));

  const crossLinksArcs: CrossLinkArc[] = [];
  for (const cl of crossLinks) {
    const h = hMap.get(cl.historyNodeId);
    const m = mMap.get(cl.mathToolId);
    if (!h || !m) continue;
    crossLinksArcs.push({
      historyId: h.id,
      mathId: m.id,
      cpX: (h.x + m.x) / 2 + 30,
      cpY: (h.y + m.y) / 2,
    });
  }

  // ── 边界 ──
  const allY = [...historyNodes, ...mathNodes].map((n) => n.y);
  const bounds = {
    minX: Math.min(leftX, rightX) - 80,
    maxX: Math.max(leftX, rightX) + 80,
    minY: Math.min(...allY) - 60,
    maxY: Math.max(...allY) + 60,
  };

  return { historyNodes, mathNodes, crossLinks: crossLinksArcs, bounds };
}
