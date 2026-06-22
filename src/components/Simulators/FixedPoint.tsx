import { useState } from 'react';
import { motion } from 'framer-motion';
import { FixedPointWidget } from '@/components/ProofTree/FixedPointWidget';
import { PROOFS, MATH_TOOLS } from '@/data';
import { useViewStore } from '@/store/viewStore';
import { THEORY_COLOR } from '@/utils/theoryColor';
import type { Variant } from '@/utils/solvers/fixedPoint';

const VARIANTS: { id: Variant; label: string }[] = [
  { id: 'brouwer', label: '布劳威尔' },
  { id: 'kakutani', label: '角谷' },
  { id: 'tarski', label: '塔斯基' },
  { id: 'fan-glicksberg', label: '范美·格利克斯伯格' },
];

/**
 * 不动点定理交互验证（全屏独立模块，符合 claude.md「模拟器独立化」原则）。
 * 把纳什存在性的四条不动点证明路径做成可拖几何替身：
 * 拖动控制点破坏映射，不动点实时跟随、诞生/湮灭——亲手验证「连续自映射必有不动点」。
 */
export function FixedPointSimulator() {
  const closeSimulator = useViewStore((s) => s.closeSimulator);
  const themeColor = THEORY_COLOR['nash'];
  const [variant, setVariant] = useState<Variant>('brouwer');

  const tool = MATH_TOOLS.find((m) => m.id === variant);
  const branch = PROOFS.find((p) => p.toolId === variant);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col"
    >
      {/* 顶栏 */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: themeColor }}>
            不动点定理交互验证
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            拖动控制点改变映射，观察不动点如何始终存在——纳什均衡存在性的几何直觉
          </p>
        </div>
        <button
          onClick={closeSimulator}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 hover:text-white"
        >
          ← 返回
        </button>
      </div>

      {/* 变体切换标签 */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-3">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVariant(v.id)}
            aria-pressed={variant === v.id}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              variant === v.id
                ? 'border-white/30 bg-white/15 text-white'
                : 'border-white/10 bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            {v.label}不动点定理
          </button>
        ))}
      </div>

      {/* 主体：左侧大图 + 右侧证明说明 */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 lg:flex-row lg:items-center lg:justify-center">
        <div className="flex justify-center">
          {/* key=variant：切换变体时重置控制点到该证明的默认映射 */}
          <FixedPointWidget key={variant} variant={variant} themeColor={themeColor} size={440} />
        </div>

        {tool && branch && (
          <div className="max-w-md space-y-4 text-sm">
            <div>
              <h3 className="text-base font-semibold" style={{ color: themeColor }}>
                {tool.name}
              </h3>
              <p className="mt-1 text-slate-400">{tool.description}</p>
            </div>
            <Field label="证明概要" value={branch.summary} />
            <Field label="适用条件" value={branch.applicability} />
            <Field label="优劣" value={branch.prosCons} />
            {branch.analogy && (
              <div className="rounded-lg bg-white/5 p-3">
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  生活化类比
                </h4>
                <p className="mt-1 italic text-slate-400">{branch.analogy}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</h4>
      <p className="mt-1 text-slate-300">{value}</p>
    </div>
  );
}
