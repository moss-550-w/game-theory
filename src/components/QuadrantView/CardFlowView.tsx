import { useFilterStore, theoryMatchesTags, getTheoriesForApplication } from '@/store/filterStore';
import { THEORIES, RELATIONS } from '@/data';
import { THEORY_COLOR } from '@/utils/theoryColor';
import type { TheoryId } from '@/types';

interface CardFlowViewProps {
  onSelectTheory?: (id: TheoryId) => void;
  compareMode?: boolean;
  onToggleCompare?: (id: TheoryId) => void;
  stacked?: boolean;
}

/**
 * HTML 卡片流布局（平板/手机降级方案，design.md §8.3）。
 * 四象限以独立卡片呈现，关系箭头以横向指示标替代。
 */
export function CardFlowView({
  onSelectTheory,
  compareMode,
  onToggleCompare,
  stacked = false,
}: CardFlowViewProps) {
  const activeTags = useFilterStore((s) => s.activeTags);
  const activeApplication = useFilterStore((s) => s.activeApplication);
  const compareSelection = useFilterStore((s) => s.compareSelection);

  const appRelatedIds = activeApplication
    ? new Set(getTheoriesForApplication(activeApplication))
    : null;

  return (
    <div className={`mx-auto ${stacked ? 'max-w-md px-4 py-4' : 'max-w-4xl px-6 py-4'}`}>
      {/* 关系指示标 */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>理论演化：</span>
        {RELATIONS.map((r) => {
          const from = THEORIES.find((t) => t.id === r.from);
          const to = THEORIES.find((t) => t.id === r.to);
          if (!from || !to) return null;
          return (
            <span key={`${r.from}->${r.to}`} className="flex items-center gap-1">
              <span style={{ color: from.themeColor }}>{from.name}</span>
              <span className="text-slate-600">→</span>
              <span style={{ color: to.themeColor }}>{to.name}</span>
              {r.style === 'dashed' && <span className="text-slate-600">（虚线）</span>}
            </span>
          );
        })}
      </div>

      {/* 卡片网格 */}
      <div className={stacked ? 'space-y-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
        {THEORIES.map((theory) => {
          const tagMatch = theoryMatchesTags(theory.tags, activeTags);
          const appMatch = appRelatedIds ? appRelatedIds.has(theory.id) : true;
          const dimmed = activeTags.length > 0 || activeApplication !== null
            ? !(tagMatch && appMatch)
            : false;
          const inCompare = compareSelection.includes(theory.id);
          const color = THEORY_COLOR[theory.id];

          return (
            <div
              key={theory.id}
              className={`rounded-xl border bg-canvas-panel p-5 transition-all ${
                dimmed ? 'opacity-30' : 'opacity-100'
              } ${inCompare ? 'ring-2 ring-offset-2 ring-offset-canvas-bg' : ''}`}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: color,
                boxShadow: inCompare ? `0 0 0 2px ${color}` : undefined,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold" style={{ color }}>
                    {theory.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{theory.scene}</p>
                </div>
                {compareMode && (
                  <button
                    onClick={() => onToggleCompare?.(theory.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      inCompare
                        ? 'text-white'
                        : 'border border-white/10 text-slate-400 hover:text-white'
                    }`}
                    style={inCompare ? { backgroundColor: color } : undefined}
                  >
                    {inCompare ? '✓ 已选' : '+ 对比'}
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-400">{theory.oneLineDef}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {theory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {!compareMode && (
                <button
                  onClick={() => onSelectTheory?.(theory.id)}
                  className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/30 hover:text-white"
                >
                  进入深度探索 →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
