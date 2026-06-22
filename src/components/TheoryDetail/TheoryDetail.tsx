import { useState } from 'react';
import { DetailPanel } from '@/components/DetailPanel/DetailPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { computeDualSpiral, LAYER_ORDER } from '@/utils/layout/spiralLayout';
import { THEORIES, EVENTS, MATH_TOOLS, PROOFS, CROSS_LINKS } from '@/data';
import { useViewStore } from '@/store/viewStore';
import { THEORY_COLOR } from '@/utils/theoryColor';
import { ProofTree } from '@/components/ProofTree/ProofTree';
import type { TheoryId } from '@/types';

const VIEW_W = 1200;
const VIEW_H = 800;

interface TheoryDetailProps {
  theoryId: TheoryId;
}

/** 历史节点角色 → 中文标签 */
const ROLE_LABEL: Record<string, string> = {
  precursor: '前驱',
  proposal: '提出',
  refinement: '精炼',
  extension: '延伸',
};

/** 数学层 → 中文标签 */
const LAYER_LABEL: Record<string, string> = {
  foundation: '底层基础',
  'core-theorem': '核心定理',
  application: '顶层应用',
  refinement: '精炼',
};

export function TheoryDetail({ theoryId }: TheoryDetailProps) {
  const theory = THEORIES.find((t) => t.id === theoryId);
  if (!theory) return null;

  // 父组件以 AnimatePresence 条件渲染；内部 hooks 顺序始终一致。
  /* eslint-disable react-hooks/rules-of-hooks */
  const perspective = useViewStore((s) => s.perspective);
  const setPerspective = useViewStore((s) => s.setPerspective);
  const goBack = useViewStore((s) => s.goBack);
  /* eslint-enable react-hooks/rules-of-hooks */
  const themeColor = THEORY_COLOR[theoryId];

  const layout = computeDualSpiral(
    EVENTS,
    MATH_TOOLS,
    PROOFS,
    CROSS_LINKS,
    theoryId,
    { width: VIEW_W, height: VIEW_H },
  );

  const showHistory = perspective === 'dual' || perspective === 'history';
  const showMath = perspective === 'dual' || perspective === 'math';
  /* eslint-disable react-hooks/rules-of-hooks */
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  /* eslint-enable react-hooks/rules-of-hooks */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col"
    >
      {/* 顶栏：返回 + 理论标题 + 透视切换 */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3">
        <button
          onClick={goBack}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          ← 返回版图
        </button>

        <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: themeColor }} />
        <h2 className="text-lg font-semibold">{theory.name}</h2>
        <span className="text-sm text-slate-400">{theory.oneLineDef}</span>

        <div className="ml-auto flex rounded-lg border border-white/10 overflow-hidden">
          {([
            { key: 'dual' as const, label: '双线' },
            { key: 'history' as const, label: '历史' },
            { key: 'math' as const, label: '数学' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPerspective(key)}
              aria-pressed={perspective === key}
              className={`px-3 py-1.5 text-sm transition-colors ${
                perspective === key
                  ? 'bg-white/15 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG 螺旋画布 + 侧边详情面板 */}
      <div className="flex min-h-0 flex-1">
        <div className={`min-h-0 flex-1 px-2 py-2 transition-all ${showPanel ? 'max-w-xl' : ''}`}>
          <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          aria-label={`${theory.name} 深度探索视图`}
        >
          <defs>
            <marker
              id="crosslink-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={themeColor} fillOpacity={0.6} />
            </marker>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 左右区域背景标签 */}
          <text x={VIEW_W * 0.18} y={30} textAnchor="middle" fontSize={14} fill="#64748B" className="select-none tracking-widest">
            历史演进线
          </text>
          <text x={VIEW_W * 0.82} y={30} textAnchor="middle" fontSize={14} fill="#64748B" className="select-none tracking-widest">
            数学支撑线
          </text>

          {/* 交叉连线（先画，在节点下方） */}
          {layout.crossLinks.map((link) => {
            const h = layout.historyNodes.find((n) => n.id === link.historyId);
            const m = layout.mathNodes.find((n) => n.id === link.mathId);
            if (!h || !m) return null;
            const cl = CROSS_LINKS.find(
              (c) => c.historyNodeId === link.historyId && c.mathToolId === link.mathId,
            );
            const labelY = (h.y + m.y) / 2 - 8;
            return (
              <motion.g
                key={`${link.historyId}->${link.mathId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <path
                  d={`M ${h.x} ${h.y} Q ${link.cpX} ${link.cpY} ${m.x} ${m.y}`}
                  fill="none"
                  stroke={themeColor}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  markerEnd="url(#crosslink-arrow)"
                />
                {cl && (
                  <text
                    x={link.cpX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={9}
                    fill={themeColor}
                    fillOpacity={0.8}
                    className="select-none"
                  >
                    {cl.label}
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* 历史演进线（左） */}
          {showHistory && (
            <g>
              {/* 纵轴参考线 */}
              <line
                x1={layout.historyNodes[0]?.x ?? 100}
                y1={layout.bounds.minY}
                x2={layout.historyNodes[0]?.x ?? 100}
                y2={layout.bounds.maxY}
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="3 6"
              />
              {layout.historyNodes.map((node, i) => {
                const ev = EVENTS.find((e) => e.id === node.id);
                if (!ev) return null;
                const isSelected = selectedNodeId === node.id;
                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.12 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedNodeId(node.id); setShowPanel(true); }}
                  >
                    <circle cx={node.x} cy={node.y} r={isSelected ? 10 : 7} fill={themeColor} fillOpacity={isSelected ? 1 : 0.9} />
                    <text x={node.x - 18} y={node.y + 4} textAnchor="end" fontSize={11} fill="#94A3B8">
                      {node.year}
                    </text>
                    <text x={node.x + 16} y={node.y - 6} fontSize={13} fill="#E2E8F0" className="select-none">
                      {node.title}
                    </text>
                    <text x={node.x + 16} y={node.y + 12} fontSize={11} fill="#64748B" className="select-none">
                      {node.contributor}
                    </text>
                    <text x={node.x + 16} y={node.y + 26} fontSize={10} fill="#475569" className="select-none italic">
                      {ROLE_LABEL[node.role] ?? node.role}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          )}

          {/* 数学支撑线（右） */}
          {showMath && (
            <g>
              <line
                x1={layout.mathNodes[0]?.x ?? VIEW_W - 100}
                y1={layout.bounds.minY}
                x2={layout.mathNodes[0]?.x ?? VIEW_W - 100}
                y2={layout.bounds.maxY}
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="3 6"
              />
              {/* 层标签：放在该层最后一个节点旁边 */}
              {LAYER_ORDER.map((layer: 'foundation' | 'core-theorem' | 'application' | 'refinement') => {
                const nodesInLayer = layout.mathNodes.filter((n) => n.layer === layer);
                if (nodesInLayer.length === 0) return null;
                const lowest = nodesInLayer.reduce((a, b) => (a.y > b.y ? a : b));
                return (
                  <text
                    key={`layer-${layer}`}
                    x={lowest.x - 16}
                    y={lowest.y + 28}
                    textAnchor="end"
                    fontSize={9}
                    fill="#475569"
                    className="select-none"
                  >
                    {LAYER_LABEL[layer]}
                  </text>
                );
              })}

              {layout.mathNodes.map((node, i) => {
                const mt = MATH_TOOLS.find((m) => m.id === node.id);
                if (!mt) return null;
                const isSelected = selectedNodeId === node.id;
                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.12 + 0.3 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedNodeId(node.id); setShowPanel(true); }}
                  >
                    <rect
                      x={node.x - 6}
                      y={node.y - 14}
                      width={12}
                      height={28}
                      rx={4}
                      fill={themeColor}
                      fillOpacity={isSelected ? 0.7 : 0.3}
                    />
                    <text x={node.x + 16} y={node.y - 4} fontSize={13} fill="#E2E8F0" className="select-none">
                      {node.name}
                    </text>
                    <text x={node.x + 16} y={node.y + 12} fontSize={10} fill="#64748B" className="select-none">
                      {LAYER_LABEL[node.layer]}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          )}
        </svg>

        {/* 数学聚焦模式下展示多分支证明树（design.md §3.3） */}
        <AnimatePresence>
          {perspective === 'math' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 max-h-[60vh] overflow-y-auto px-4"
            >
              <ProofTree theoryId={theoryId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 侧边详情面板（点击节点后滑入） */}
      <AnimatePresence>
        {showPanel && selectedNodeId && (
          <DetailPanel
            theoryId={theoryId}
            selectedNodeId={selectedNodeId}
            onClose={() => setShowPanel(false)}
          />
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
