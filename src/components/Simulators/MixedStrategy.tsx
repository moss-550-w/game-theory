import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  expectedPayoffA,
  expectedPayoffB,
  solveMixedStrategy,
  PD_MATRIX,
} from '@/utils/solvers/mixedStrategy';
import { useViewStore } from '@/store/viewStore';
import { THEORY_COLOR } from '@/utils/theoryColor';

const STEPS = 51; // 0 to 1 in 0.02 increments

export function MixedStrategySimulator() {
  const closeSimulator = useViewStore((s) => s.closeSimulator);
  const themeColor = THEORY_COLOR['nash'];

  const matrix = PD_MATRIX;
  const [pA, setPA] = useState(0.5); // A 选上策概率
  const [pB, setPB] = useState(0.5); // B 选上策概率

  const eq = useMemo(() => solveMixedStrategy(matrix), [matrix]);

  // 生成曲线数据点
  const curveA = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < STEPS; i++) {
      const q = i / (STEPS - 1);
      points.push({ x: q, y: expectedPayoffA(pA, q, matrix) });
    }
    return points;
  }, [pA, matrix]);

  const curveB = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < STEPS; i++) {
      const q = i / (STEPS - 1);
      points.push({ x: q, y: expectedPayoffB(q, pB, matrix) });
    }
    return points;
  }, [pB, matrix]);

  const svgW = 500;
  const svgH = 300;
  const padX = 50;
  const padY = 40;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const xScale = (v: number) => padX + v * plotW;
  const yScale = (v: number) => {
    const allY = [...curveA.map((p) => p.y), ...curveB.map((p) => p.y)];
    const min = Math.min(...allY, 0);
    const max = Math.max(...allY, 0);
    const range = max - min || 1;
    return padY + plotH - ((v - min) / range) * plotH;
  };

  const eqMarkerX = xScale(eq.qStar);
  const eqMarkerY = yScale(eq.equilibriumPayoff[0]);

  return (
    <div className="flex h-full flex-col">
      {/* 顶栏 */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: themeColor }}>
            混合策略模拟器
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            调节双方混合概率，观察期望收益曲线与均衡点的关系
          </p>
        </div>
        <button
          onClick={closeSimulator}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          ← 返回
        </button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 p-6">
        {/* 均衡标记 */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center">
            <div className="text-xs text-emerald-400">均衡概率</div>
            <div className="mt-1 text-lg font-semibold text-emerald-300">
              p* = {eq.pStar.toFixed(2)}, q* = {eq.qStar.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              均衡收益：({eq.equilibriumPayoff[0].toFixed(1)}, {eq.equilibriumPayoff[1].toFixed(1)})
            </div>
          </div>
        </div>

        {/* 滑杆控制 */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <SliderControl
            label="A 选上策概率 p"
            value={pA}
            onChange={setPA}
            color={themeColor}
          />
          <SliderControl
            label="B 选上策概率 q"
            value={pB}
            onChange={setPB}
            color="#1D8348"
          />
        </div>

        {/* 收益曲线图 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-auto w-full max-w-2xl">
            {/* 坐标轴 */}
            <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="#334155" />
            <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="#334155" />

            {/* 轴标签 */}
            <text x={padX + plotW / 2} y={svgH - 8} textAnchor="middle" fontSize={11} fill="#64748B">
              B 的混合概率 q
            </text>
            <text x={14} y={padY + plotH / 2} textAnchor="middle" fontSize={11} fill="#64748B" transform={`rotate(-90, 14, ${padY + plotH / 2})`}>
              期望收益
            </text>

            {/* 网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line
                  x1={xScale(v)}
                  y1={padY}
                  x2={xScale(v)}
                  y2={padY + plotH}
                  stroke="#1E293B"
                  strokeDasharray="3 6"
                />
                <text x={xScale(v)} y={padY + plotH + 16} textAnchor="middle" fontSize={9} fill="#475569">
                  {v.toFixed(2)}
                </text>
              </g>
            ))}

            {/* A 的期望收益曲线（给定 pA，随 q 变化） */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
              d={linePath(curveA, xScale, yScale)}
              fill="none"
              stroke={themeColor}
              strokeWidth={2.5}
            />
            <text x={xScale(curveA[STEPS - 1].x) + 4} y={yScale(curveA[STEPS - 1].y)} fontSize={10} fill={themeColor}>
              E_A
            </text>

            {/* B 的期望收益曲线（给定 pB，随 q 变化）——这里用 p 作为横轴 */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              d={linePath(curveB, xScale, yScale)}
              fill="none"
              stroke="#1D8348"
              strokeWidth={2.5}
            />
            <text x={xScale(curveB[STEPS - 1].x) + 4} y={yScale(curveB[STEPS - 1].y)} fontSize={10} fill="#1D8348">
              E_B
            </text>

            {/* 均衡点标记 */}
            <circle cx={eqMarkerX} cy={eqMarkerY} r={6} fill={themeColor} fillOpacity={0.9} />
            <text x={eqMarkerX + 10} y={eqMarkerY - 8} fontSize={10} fill={themeColor} fillOpacity={0.9}>
              均衡
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-48 accent-white"
        style={{ accentColor: color }}
      />
      <span className="text-sm font-medium text-white">{value.toFixed(2)}</span>
    </div>
  );
}

function linePath(
  points: { x: number; y: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
    .join(' ');
}
