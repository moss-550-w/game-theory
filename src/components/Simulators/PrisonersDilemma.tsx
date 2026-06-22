import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  payoff,
  getEquilibriumState,
  DEFAULT_PD,
  type Choice,
  type PDConfig,
} from '@/utils/solvers/prisonersDilemma';
import { useViewStore } from '@/store/viewStore';
import { THEORY_COLOR } from '@/utils/theoryColor';

const LABELS: Record<Choice, string> = { cooperate: '合作', defect: '背叛' };

interface PDState {
  a: Choice;
  b: Choice;
}

const INITIAL: PDState = { a: 'defect', b: 'defect' };

export function PrisonersDilemmaSimulator() {
  const closeSimulator = useViewStore((s) => s.closeSimulator);
  const [state, setState] = useState<PDState>(INITIAL);
  const [config, setConfig] = useState<PDConfig>({ ...DEFAULT_PD });
  const themeColor = THEORY_COLOR['nash'];

  const [pa, pb] = payoff(state.a, state.b, config);
  const eqState = getEquilibriumState(state.a, state.b, config);

  const eqLabel = eqState === 'pareto' ? '帕累托最优' : eqState === 'nash' ? '纳什均衡' : '非均衡';
  const eqColor =
    eqState === 'pareto'
      ? '#34D399'
      : eqState === 'nash'
        ? '#FBBF24'
        : '#94A3B8';

  const setPlayer = (player: 'a' | 'b', choice: Choice) => {
    setState((s) => ({ ...s, [player]: choice }));
  };

  const resetConfig = () => setConfig({ ...DEFAULT_PD });

  return (
    <div className="flex h-full flex-col">
      {/* 顶栏 */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: themeColor }}>
            囚徒困境模拟器
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            切换双方策略，观察个体理性如何导致集体次优
          </p>
        </div>
        <button
          onClick={closeSimulator}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          ← 返回
        </button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-8 p-6">
        {/* 收益矩阵 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <table className="border-collapse text-center">
            <thead>
              <tr>
                <th className="p-2" />
                <th className="px-4 py-2 text-sm text-slate-400">B：合作</th>
                <th className="px-4 py-2 text-sm text-slate-400">B：背叛</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 text-sm text-slate-400">A：合作</td>
                <PayoffCell value={config.R} label={`(${config.R}, ${config.R})`} highlight={state.a === 'cooperate' && state.b === 'cooperate'} />
                <PayoffCell value={config.S} label={`(${config.S}, ${config.T})`} highlight={state.a === 'cooperate' && state.b === 'defect'} />
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-slate-400">A：背叛</td>
                <PayoffCell value={config.T} label={`(${config.T}, ${config.S})`} highlight={state.a === 'defect' && state.b === 'cooperate'} />
                <PayoffCell value={config.P} label={`(${config.P}, ${config.P})`} highlight={state.a === 'defect' && state.b === 'defect'} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* 参与者控制 */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {(['a', 'b'] as const).map((player) => (
            <div key={player} className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-slate-300">
                参与者 {player.toUpperCase()}
              </span>
              <div className="flex rounded-xl border border-white/10 overflow-hidden">
                {(['cooperate', 'defect'] as Choice[]).map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setPlayer(player, choice)}
                    className={`px-5 py-2.5 text-sm font-medium transition-all ${
                      state[player] === choice
                        ? 'bg-white/15 text-white'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {LABELS[choice]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 均衡状态提示 */}
        <motion.div
          key={eqState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border px-6 py-3 text-center"
          style={{
            borderColor: eqColor + '66',
            backgroundColor: eqColor + '1A',
          }}
        >
          <span className="text-sm font-medium" style={{ color: eqColor }}>
            {eqLabel}
          </span>
          <span className="ml-3 text-sm text-slate-400">
            当前收益：({pa}, {pb})
          </span>
        </motion.div>

        {/* 参数调节 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">收益参数调节</span>
            <button
              onClick={resetConfig}
              className="text-xs text-slate-500 transition-colors hover:text-white"
            >
              重置
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {(
              [
                ['P', '背叛-背叛', 'P'],
                ['R', '合作-合作', 'R'],
                ['T', '背叛-合作', 'T'],
                ['S', '合作-背叛', 'S'],
              ] as const
            ).map(([key, label, short]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="w-16 text-xs text-slate-400">{short}</label>
                <span className="text-xs text-slate-500">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={config[key]}
                  onChange={(e) => setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))}
                  className="h-1 w-24 accent-white"
                />
                <span className="w-6 text-right text-xs text-slate-400">{config[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoffCell({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight: boolean;
}) {
  return (
    <motion.td
      animate={{
        scale: highlight ? 1.05 : 1,
        backgroundColor: highlight ? 'rgba(255,255,255,0.1)' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
      className="rounded-lg px-6 py-4"
    >
      <div className={`text-lg font-semibold ${highlight ? 'text-white' : 'text-slate-300'}`}>
        {label}
      </div>
      <div className="text-xs text-slate-500">收益 {value}</div>
    </motion.td>
  );
}
