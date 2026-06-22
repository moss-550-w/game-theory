import { useViewStore } from '@/store/viewStore';
import { EVENTS, APPLICATIONS } from '@/data';

/**
 * 环绕层切换按钮（独立子组件，own hooks，始终渲染）。
 * 在深度视图模式下禁用交互，避免 App 中的条件渲染破坏 hooks 调用顺序。
 */
export function RingToggles() {
  const ringsVisible = useViewStore((s) => s.ringsVisible);
  const toggleRings = useViewStore((s) => s.toggleRings);
  const mode = useViewStore((s) => s.mode);
  const isQuadrant = mode === 'quadrant';

  return (
    <div className="flex gap-2">
      <ToggleButton
        active={ringsVisible}
        onToggle={toggleRings}
        disabled={!isQuadrant}
        label="时间环"
        hint={`${EVENTS.length} 个历史节点`}
      />
      <ToggleButton
        active={ringsVisible}
        onToggle={toggleRings}
        disabled={!isQuadrant}
        label="应用环"
        hint={`${APPLICATIONS.length} 个应用领域`}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onToggle,
  disabled,
  label,
  hint,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        disabled
          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600'
          : active
            ? 'border-white/30 bg-white/15 text-white'
            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
      }`}
      title={hint}
    >
      {label}
    </button>
  );
}
