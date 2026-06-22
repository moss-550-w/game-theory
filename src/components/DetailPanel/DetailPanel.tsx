import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEORIES, EVENTS, MATH_TOOLS, APPLICATIONS, CROSS_LINKS } from '@/data';
import { usePathStore } from '@/store/pathStore';
import { THEORY_COLOR } from '@/utils/theoryColor';
import type { TheoryId, HistoryNode } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  precursor: '前驱',
  proposal: '提出',
  refinement: '精炼',
  extension: '延伸',
};

const LAYER_LABEL: Record<string, string> = {
  foundation: '底层基础',
  'core-theorem': '核心定理',
  application: '顶层应用',
  refinement: '精炼',
};

interface DetailPanelProps {
  theoryId: TheoryId;
  /** 当前选中的节点 id（用于高亮），可选 */
  selectedNodeId?: string | null;
  onClose: () => void;
}

/**
 * 详情面板（design.md §6）。
 * 以可折叠分层卡片呈现理论详情：
 *   1. 概念卡（顶层锚点信息）
 *   2. 历史卡（前驱→提出→精炼→延伸）
 *   3. 数学卡（证明路径 + 应用历程）
 *   4. 应用卡（典型场景）
 *
 * 支持标记关键节点与添加笔记。
 */
export function DetailPanel({ theoryId, selectedNodeId, onClose }: DetailPanelProps) {
  // 由父组件 AnimatePresence 条件渲染；内部 hooks 顺序始终一致。
  /* eslint-disable react-hooks/rules-of-hooks */
  const theory = THEORIES.find((t) => t.id === theoryId);
  if (!theory) return null;

  const themeColor = THEORY_COLOR[theoryId];
  const [openCards, setOpenCards] = useState<Set<string>>(new Set(['concept']));
  const toggleCard = useCallback((id: string) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const theoryEvents = EVENTS.filter((e) => e.theoryId === theoryId);
  const theoryMath = MATH_TOOLS.filter((m) =>
    CROSS_LINKS.some((cl) => cl.mathToolId === m.id && theoryEvents.some((e) => e.id === cl.historyNodeId)),
  );
  const theoryApps = APPLICATIONS.filter((a) => a.relatedTheories.includes(theoryId));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-canvas-bg/95 p-5 backdrop-blur-sm"
    >
      {/* 顶栏 */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: themeColor }} />
          <h3 className="text-base font-semibold">{theory.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 p-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* 概念卡 */}
        <FoldableCard
          id="concept"
          title="概念"
          subtitle="一句话定义"
          open={openCards.has('concept')}
          onToggle={() => toggleCard('concept')}
          color={themeColor}
        >
          <p className="text-sm text-slate-300">{theory.oneLineDef}</p>
          <div className="mt-3 space-y-2">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">核心假设</h4>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-300">
                {theory.coreAssumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">均衡条件</h4>
              <p className="mt-1 text-xs text-slate-300">{theory.equilibriumCondition}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">标签</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {theory.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FoldableCard>

        {/* 历史卡 */}
        <FoldableCard
          id="history"
          title="历史演进"
          subtitle={`${theoryEvents.length} 个节点`}
          open={openCards.has('history')}
          onToggle={() => toggleCard('history')}
          color={themeColor}
        >
          <div className="space-y-2">
            {theoryEvents.map((ev) => (
              <HistoryItem
                key={ev.id}
                event={ev}
                selected={selectedNodeId === ev.id}
              />
            ))}
          </div>
        </FoldableCard>

        {/* 数学卡 */}
        <FoldableCard
          id="math"
          title="数学支撑"
          subtitle={`${theoryMath.length} 个工具`}
          open={openCards.has('math')}
          onToggle={() => toggleCard('math')}
          color={themeColor}
        >
          <div className="space-y-2">
            {theoryMath.map((tool) => {
              const relatedLinks = CROSS_LINKS.filter((cl) => cl.mathToolId === tool.id);
              const proofs = relatedLinks.map((cl) => {
                const ev = EVENTS.find((e) => e.id === cl.historyNodeId);
                return ev ? { ...cl, event: ev } : null;
              }).filter(Boolean);
              return (
                <div key={tool.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{tool.name}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
                      {LAYER_LABEL[tool.layer]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
                  {proofs.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">应用历程</h4>
                      <ul className="mt-1 space-y-0.5">
                        {proofs.map((p, i) => (
                          <li key={`${p!.historyNodeId}-${i}`} className="text-xs text-slate-400">· {p!.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FoldableCard>

        {/* 应用卡 */}
        <FoldableCard
          id="applications"
          title="典型应用"
          subtitle={`${theoryApps.length} 个领域`}
          open={openCards.has('applications')}
          onToggle={() => toggleCard('applications')}
          color={themeColor}
        >
          <div className="space-y-2">
            {theoryApps.map((app) => (
              <div key={app.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
                <span className="text-sm font-medium text-slate-200">{app.name}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {app.milestones.map((m) => (
                    <span key={m.year} className="text-xs text-slate-500">
                      {m.year} {m.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FoldableCard>

        {/* 笔记卡 */}
        <FoldableCard
          id="notes"
          title="学习笔记"
          subtitle="记录你的理解"
          open={openCards.has('notes')}
          onToggle={() => toggleCard('notes')}
          color="#94A3B8"
        >
          <NoteSection theoryId={theoryId} />
        </FoldableCard>

        {/* 学习路径卡 */}
        <FoldableCard
          id="path"
          title="学习路径"
          subtitle="标记的关键节点"
          open={openCards.has('path')}
          onToggle={() => toggleCard('path')}
          color="#94A3B8"
        >
          <PathSection theoryId={theoryId} />
        </FoldableCard>
      </div>
    </motion.div>
  );
}

/* ── Sub-components ── */

interface FoldableCardProps {
  id: string;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  color: string;
  children: React.ReactNode;
}

function FoldableCard({ title, subtitle, open, onToggle, color, children }: FoldableCardProps) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-slate-200">{title}</span>
          <span className="text-xs text-slate-500">{subtitle}</span>
        </div>
        <span className="text-xs text-slate-500 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryItem({
  event,
  selected,
}: {
  event: HistoryNode;
  selected: boolean;
}) {
  const { markNode, unmarkNode, markedNodes } = usePathStore();
  const isMarked = markedNodes.some((n) => n.id === event.id);

  return (
    <div
      className={`rounded-lg border p-2.5 transition-all ${
        selected ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{event.year}</span>
            <span className="text-sm font-medium text-slate-200">{event.title}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{event.contributor}</p>
          <span className="inline-block mt-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500">
            {ROLE_LABEL[event.role]}
          </span>
        </div>
        <button
          onClick={() => (isMarked ? unmarkNode(event.id) : markNode({ id: event.id, label: event.title, theoryId: event.theoryId, type: 'history' }))}
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs transition-colors ${
            isMarked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500 hover:text-white'
          }`}
          title={isMarked ? '取消标记' : '标记为关键节点'}
        >
          {isMarked ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}

function NoteSection({ theoryId }: { theoryId: TheoryId }) {
  const { notes, addNote, removeNote } = usePathStore();
  const [text, setText] = useState('');
  const theoryNotes = notes.filter((n) => n.theoryId === theoryId);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote(theoryId, trimmed);
    setText('');
  };

  return (
    <div className="space-y-2">
      {theoryNotes.map((note) => (
        <div key={note.id} className="rounded-lg border border-white/5 bg-white/5 p-2.5">
          <p className="text-xs text-slate-300">{note.text}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              {new Date(note.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <button
              onClick={() => removeNote(note.id)}
              className="text-xs text-slate-600 transition-colors hover:text-red-400"
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写下你的理解..."
          rows={2}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-600 focus:border-white/30"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="self-end rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  );
}

function PathSection({ theoryId }: { theoryId: TheoryId }) {
  const { markedNodes, exportPath, clearAll } = usePathStore();
  const theoryMarked = markedNodes.filter((n) => n.theoryId === theoryId);

  const handleExport = () => {
    const text = exportPath();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-theory-learning-path-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      {theoryMarked.length === 0 ? (
        <p className="text-xs text-slate-500">尚未标记任何关键节点。在历史卡中点击 ☆ 标记。</p>
      ) : (
        <div className="space-y-1">
          {theoryMarked.map((n) => (
            <div key={n.id} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
              <span className="text-xs text-slate-300">{n.label}</span>
              <span className="text-xs text-amber-400">★</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleExport}
          disabled={markedNodes.length === 0}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          导出 Markdown
        </button>
        <button
          onClick={clearAll}
          disabled={markedNodes.length === 0}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          清除全部
        </button>
      </div>
    </div>
  );
}
