import { motion, AnimatePresence } from 'framer-motion';
import { useFilterStore } from '@/store/filterStore';
import { THEORIES, APPLICATIONS, EVENTS } from '@/data';
import type { TheoryId } from '@/types';

interface CompareCardsProps {
  onNavigateToTheory: (id: TheoryId) => void;
}

/**
 * 对比模式卡片（design.md §4.2）。
 * 当 2+ 理论被选中时，在屏幕中央弹出并列卡片，
 * 标注适用范围、数学工具、局限性等对比信息。
 */
export function CompareCards({ onNavigateToTheory }: CompareCardsProps) {
  const compareSelection = useFilterStore((s) => s.compareSelection);
  const clearCompare = useFilterStore((s) => s.clearCompare);

  if (compareSelection.length < 2) return null;

  const selected = compareSelection
    .map((id) => THEORIES.find((t) => t.id === id)!)
    .filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={clearCompare}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 24 }}
          className="flex max-w-5xl gap-4 overflow-x-auto px-6 py-8"
          onClick={(e) => e.stopPropagation()}
        >
          {selected.map((theory) => {
            const relatedApps = APPLICATIONS.filter((a) =>
              a.relatedTheories.includes(theory.id),
            );
            const relatedEvents = EVENTS.filter((e) => e.theoryId === theory.id);

            return (
              <div
                key={theory.id}
                className="w-80 shrink-0 rounded-2xl border border-white/10 bg-canvas-panel p-5"
                style={{ borderTop: `3px solid ${theory.themeColor}` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold" style={{ color: theory.themeColor }}>
                    {theory.name}
                  </h3>
                  <button
                    onClick={() => {
                      clearCompare();
                      onNavigateToTheory(theory.id);
                    }}
                    className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 transition-colors hover:border-white/30 hover:text-white"
                  >
                    深入 →
                  </button>
                </div>

                <p className="mt-2 text-sm text-slate-400">{theory.oneLineDef}</p>

                <div className="mt-4 space-y-3">
                  <Section title="核心假设">
                    <ul className="list-disc pl-4 text-xs text-slate-300">
                      {theory.coreAssumptions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="均衡条件">
                    <p className="text-xs text-slate-300">{theory.equilibriumCondition}</p>
                  </Section>

                  <Section title="相关应用">
                    <div className="flex flex-wrap gap-1">
                      {relatedApps.map((app) => (
                        <span
                          key={app.id}
                          className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {app.name}
                        </span>
                      ))}
                    </div>
                  </Section>

                  <Section title="历史节点">
                    <span className="text-xs text-slate-400">
                      {relatedEvents.length} 个事件（{relatedEvents[0]?.year ?? '—'} — {relatedEvents[relatedEvents.length - 1]?.year ?? '—'}）
                    </span>
                  </Section>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCompare}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="关闭对比"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</h4>
      <div className="mt-1">{children}</div>
    </div>
  );
}
