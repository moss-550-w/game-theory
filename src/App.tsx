import { useState } from 'react';
import { QuadrantView } from '@/components/QuadrantView/QuadrantView';
import { THEORIES } from '@/data';
import type { TheoryId } from '@/types';

/**
 * 应用壳（M2）。
 * 主体为四象限主视图；点击象限暂以底部说明条反馈所选支柱，
 * 深度探索视图（双重螺旋）将在 M4 接入。
 */
export default function App() {
  const [selected, setSelected] = useState<TheoryId | null>(null);
  const selectedTheory = THEORIES.find((t) => t.id === selected) ?? null;

  return (
    <div className="flex h-screen flex-col bg-canvas-bg text-slate-100">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-wide">博弈论思想演进全景</h1>
        <p className="mt-1 text-sm text-slate-400">
          四象限理论版图 · 点击任一支柱进入（深度视图 M4 接入）
        </p>
      </header>

      <main className="min-h-0 flex-1 px-4 py-4">
        <QuadrantView onSelectTheory={setSelected} />
      </main>

      <footer className="border-t border-white/10 px-6 py-3 text-sm">
        {selectedTheory ? (
          <span>
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
              style={{ backgroundColor: selectedTheory.themeColor }}
            />
            <span className="font-medium">{selectedTheory.name}</span>
            <span className="text-slate-400"> — {selectedTheory.oneLineDef}</span>
          </span>
        ) : (
          <span className="text-slate-500">尚未选择理论支柱</span>
        )}
      </footer>
    </div>
  );
}
