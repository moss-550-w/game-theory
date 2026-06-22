import { useState } from 'react';
import { QuadrantView } from '@/components/QuadrantView/QuadrantView';
import { THEORIES, EVENTS, APPLICATIONS } from '@/data';
import type { TheoryId } from '@/types';

/**
 * 应用壳（M3）。
 * 主体为四象限主视图，含关系箭头（M3）与可开关的环绕层（时间环 / 应用环）。
 */
export default function App() {
  const [selected, setSelected] = useState<TheoryId | null>(null);
  const [ringsVisible, setRingsVisible] = useState(false);

  const selectedTheory = THEORIES.find((t) => t.id === selected) ?? null;

  return (
    <div className="flex h-screen flex-col bg-canvas-bg text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">博弈论思想演进全景</h1>
          <p className="mt-1 text-sm text-slate-400">
            四象限理论版图 · {ringsVisible ? '环绕层已开启' : '点击下方按钮开启时间环 / 应用环'}
          </p>
        </div>
        <div className="flex gap-2">
          <ToggleButton
            active={ringsVisible}
            onToggle={() => setRingsVisible((v) => !v)}
            label="时间环"
            hint={`${EVENTS.length} 个历史节点`}
          />
          <ToggleButton
            active={ringsVisible}
            onToggle={() => setRingsVisible((v) => !v)}
            label="应用环"
            hint={`${APPLICATIONS.length} 个应用领域`}
          />
        </div>
      </header>

      <main className="min-h-0 flex-1 px-4 py-4">
        <QuadrantView onSelectTheory={setSelected} ringsVisible={ringsVisible} />
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

function ToggleButton({
  active,
  onToggle,
  label,
  hint,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-white/30 bg-white/15 text-white'
          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
      }`}
      title={hint}
    >
      {label}
    </button>
  );
}