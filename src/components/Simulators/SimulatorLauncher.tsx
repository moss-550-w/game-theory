import { useViewStore } from '@/store/viewStore';
import type { SimulatorId } from '@/store/viewStore';

const SIMULATORS: { id: SimulatorId; label: string }[] = [
  { id: 'fixed-point', label: '不动点定理' },
  { id: 'prisoners-dilemma', label: '囚徒困境' },
  { id: 'mixed-strategy', label: '混合策略' },
  { id: 'backward-induction', label: '逆向归纳' },
];

/**
 * 交互模拟器入口（四象限主视图顶栏）。
 * 全屏模拟器此前在 store 中已就绪但无 UI 入口——此处提供统一启动按钮。
 */
export function SimulatorLauncher() {
  const openSimulator = useViewStore((s) => s.openSimulator);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-slate-500">交互模拟器</span>
      {SIMULATORS.map((s) => (
        <button
          key={s.id}
          onClick={() => openSimulator(s.id)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
