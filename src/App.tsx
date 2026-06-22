import { AnimatePresence, motion } from 'framer-motion';
import { ResponsiveQuadrantView } from '@/components/QuadrantView/ResponsiveQuadrantView';
import { RingToggles } from '@/components/QuadrantView/RingToggles';
import { CompareCards } from '@/components/Filters/CompareMode';
import { TagFilter, ApplicationFilter, CompareModeToggle } from '@/components/Filters/TagFilter';
import { TheoryDetail } from '@/components/TheoryDetail/TheoryDetail';
import {
  PrisonersDilemmaSimulator,
  BackwardInductionSimulator,
  MixedStrategySimulator,
} from '@/components/Simulators';
import { useViewStore } from '@/store/viewStore';
import { useFilterStore } from '@/store/filterStore';
import type { TheoryId } from '@/types';

const SIMULATOR_COMPONENTS = {
  'prisoners-dilemma': PrisonersDilemmaSimulator,
  'backward-induction': BackwardInductionSimulator,
  'mixed-strategy': MixedStrategySimulator,
} as const;

export default function App() {
  const mode = useViewStore((s) => s.mode);
  const focusedId = useViewStore((s) => s.focusedTheory);
  const activeSimulator = useViewStore((s) => s.activeSimulator);
  const compareMode = useFilterStore((s) => s.compareSelection.length >= 2);

  const handleSelectTheory = (id: TheoryId) => {
    if (useFilterStore.getState().compareSelection.length >= 2) return;
    useViewStore.getState().focusTheory(id);
  };

  const handleToggleCompare = (id: TheoryId) => {
    useFilterStore.getState().toggleCompare(id);
  };

  const SimulatorComponent =
    activeSimulator && SIMULATOR_COMPONENTS[activeSimulator]
      ? SIMULATOR_COMPONENTS[activeSimulator]
      : null;

  return (
    <div className="flex h-screen flex-col bg-canvas-bg text-slate-100">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-gray-900"
      >
        跳转到主要内容
      </a>

      <header className="border-b border-white/10 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-wide">博弈论思想演进全景</h1>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'detail'
                ? '深度探索视图 · 双重螺旋'
                : mode === 'simulator'
                  ? '交互模拟器'
                  : '四象限理论版图 · 点击任一支柱进入深度探索'}
            </p>
          </div>
          <RingToggles />
        </div>

        {mode === 'quadrant' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-wrap items-center gap-4"
          >
            <TagFilter />
            <ApplicationFilter />
            <CompareModeToggle />
          </motion.div>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'detail' && focusedId ? (
            <TheoryDetail key="detail" theoryId={focusedId as TheoryId} />
          ) : mode === 'simulator' && SimulatorComponent ? (
            <SimulatorComponent key="simulator" />
          ) : (
            <ResponsiveQuadrantView
              key="quadrant"
              compareMode={compareMode}
              onToggleCompare={handleToggleCompare}
              onSelectTheory={handleSelectTheory}
            />
          )}
        </AnimatePresence>
      </main>

      <CompareCards onNavigateToTheory={useViewStore.getState().focusTheory} />
    </div>
  );
}
