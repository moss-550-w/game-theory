import { AnimatePresence } from 'framer-motion';
import { QuadrantView } from '@/components/QuadrantView/QuadrantView';
import { RingToggles } from '@/components/QuadrantView/RingToggles';
import { TheoryDetail } from '@/components/TheoryDetail/TheoryDetail';
import { useViewStore } from '@/store/viewStore';
import type { TheoryId } from '@/types';

export default function App() {
  const mode = useViewStore((s) => s.mode);
  const focusedId = useViewStore((s) => s.focusedTheory);

  return (
    <div className="flex h-screen flex-col bg-canvas-bg text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">博弈论思想演进全景</h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'detail'
              ? '深度探索视图 · 双重螺旋'
              : '四象限理论版图 · 点击任一支柱进入深度探索'}
          </p>
        </div>
        <RingToggles />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'detail' && focusedId ? (
            <TheoryDetail key="detail" theoryId={focusedId as TheoryId} />
          ) : (
            <QuadrantView key="quadrant" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
