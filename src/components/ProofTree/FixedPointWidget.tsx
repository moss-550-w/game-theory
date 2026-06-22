import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ANCHOR_XS,
  DEFAULT_YS,
  BAND_HALF_WIDTH,
  findFixedPoints,
  clampMonotone,
  findSetValuedFixedPoints,
  isBandVariant,
  type Variant,
} from '@/utils/solvers/fixedPoint';
import { createPlotScale, pointsToPath, bandToPath, clamp01, type Pt } from '@/utils/plotting/scale';
import { useDraggableValues, DragHandle } from '@/components/ui';

const VARIANT_HINT: Record<Variant, string> = {
  brouwer: '拖动控制点改变连续映射 f，曲线与对角线 y=x 的交点即不动点——无论怎么拖，交点始终存在。',
  kakutani: '集值映射（带状）：拖动可平移取值带，带与对角线相交处即集值不动点。',
  tarski: '单调映射：拖动时自动保持非减，高亮显示最小与最大不动点（不动点集成格）。',
  'fan-glicksberg': '连续策略空间上的集值映射：带与对角线的交集即均衡，把存在性推广到无限策略。',
};

interface FixedPointWidgetProps {
  variant: Variant;
  themeColor: string;
}

/**
 * 不动点交互件（planv2.md 第一交付物）。
 * 把「连续自映射必有不动点」做成可拖曲线 ∩ 对角线：用户拖动控制点破坏映射，
 * 交点实时重算且始终存在——抽象命题变成可被手破坏、再自我恢复的几何不变量。
 *
 * 拖拽机制与控制点视觉已抽到 @/components/ui（useDraggableValues + DragHandle），
 * 坐标换算抽到 @/utils/plotting/scale，供后续三支柱交互件复用。
 */
export function FixedPointWidget({ variant, themeColor }: FixedPointWidgetProps) {
  const reduce = useReducedMotion();
  const scale = useMemo(() => createPlotScale(300, 34), []);
  const band = isBandVariant(variant);

  // tarski：拖拽后强制 y 非减（格上单调映射）
  const constrain = useCallback(
    (vals: number[]) =>
      variant === 'tarski'
        ? clampMonotone(vals.map((y, i) => ({ x: ANCHOR_XS[i], y }))).map((p) => p.y)
        : vals,
    [variant],
  );

  const { svgRef, values: ys, draggingIndex, startDrag, containerHandlers } = useDraggableValues({
    initial: DEFAULT_YS[variant],
    scale,
    axis: 'y',
    constrain,
  });

  const centerPts: Pt[] = ys.map((y, i) => ({ x: ANCHOR_XS[i], y }));
  const lowerPts: Pt[] = centerPts.map((p) => ({ x: p.x, y: clamp01(p.y - BAND_HALF_WIDTH) }));
  const upperPts: Pt[] = centerPts.map((p) => ({ x: p.x, y: clamp01(p.y + BAND_HALF_WIDTH) }));

  // findFixedPoints / findSetValuedFixedPoints 均返回升序 → 用排序索引作跨帧稳定身份：
  // 数目稳定时 key=i 不变 → cx/cy 平滑跟随；数目突变时边界索引进/出 → AnimatePresence 强调。
  const fixedPoints = band ? [] : findFixedPoints(centerPts);
  const intervals = band ? findSetValuedFixedPoints(lowerPts, upperPts) : [];

  // 动画过渡（reduce-motion 时全部瞬时）
  const followSpring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 22 };
  const popSpring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 500, damping: 24 };
  const morph = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 700, damping: 42 };
  const fade = { duration: reduce ? 0 : 0.25 };

  // 无障碍：文字冗余读出当前不动点（颜色 + 文字双编码）
  const readout = band
    ? intervals.length
      ? `不动点区间：${intervals.map((iv) => `[${iv.start.toFixed(2)}, ${iv.end.toFixed(2)}]`).join('、')}`
      : '当前带未与对角线相交'
    : `不动点 ${fixedPoints.length} 个：${fixedPoints.map((f) => f.toFixed(2)).join('、') || '—'}`;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
        <span className="text-xs font-medium text-slate-300">动手验证</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${scale.view} ${scale.view}`}
        className="mx-auto block h-auto w-full max-w-[300px] select-none"
        style={{ touchAction: 'none' }}
        role="img"
        aria-label={`${variant} 不动点交互图：${readout}`}
        {...containerHandlers}
      >
        {/* 绘图区边框 */}
        <rect x={scale.pad} y={scale.pad} width={scale.plot} height={scale.plot} fill="none" stroke="#1E293B" />

        {/* 对角线 y = x */}
        <line
          x1={scale.sx(0)}
          y1={scale.sy(0)}
          x2={scale.sx(1)}
          y2={scale.sy(1)}
          stroke="#475569"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text x={scale.sx(1) - 4} y={scale.sy(1) + 14} textAnchor="end" fontSize={10} fill="#64748B">
          y = x
        </text>

        {/* 集值不动点区间（带变体）：端点平滑跟随 + 诞生/湮灭 */}
        <AnimatePresence>
          {intervals.map((iv, i) => (
            <motion.line
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x1: scale.sx(iv.start),
                y1: scale.sy(iv.start),
                x2: scale.sx(iv.end),
                y2: scale.sy(iv.end),
              }}
              exit={{ opacity: 0 }}
              transition={{ x1: followSpring, y1: followSpring, x2: followSpring, y2: followSpring, opacity: fade }}
              stroke="#34D399"
              strokeWidth={6}
              strokeLinecap="round"
            />
          ))}
        </AnimatePresence>

        {/* band 变体：上下边界 + 填充带（d 随手 spring 形变） */}
        {band ? (
          <>
            <motion.path
              animate={{ d: bandToPath(lowerPts, upperPts, scale) }}
              transition={{ d: morph }}
              fill={themeColor}
              fillOpacity={0.15}
              stroke="none"
            />
            <motion.path
              animate={{ d: pointsToPath(lowerPts, scale) }}
              transition={{ d: morph }}
              fill="none"
              stroke={themeColor}
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            <motion.path
              animate={{ d: pointsToPath(upperPts, scale) }}
              transition={{ d: morph }}
              fill="none"
              stroke={themeColor}
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
          </>
        ) : (
          <motion.path
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1, d: pointsToPath(centerPts, scale) }}
            transition={{ d: morph, opacity: { duration: reduce ? 0 : 0.4 } }}
            fill="none"
            stroke={themeColor}
            strokeWidth={2.5}
          />
        )}

        {/* 单值不动点标记：跟手平滑滑动（1）+ 诞生放大淡入 / 湮灭收缩淡出（2） */}
        <AnimatePresence>
          {fixedPoints.map((fp, i) => {
            const multi = fixedPoints.length > 1;
            const isLeast = variant === 'tarski' && multi && i === 0;
            const isGreatest = variant === 'tarski' && multi && i === fixedPoints.length - 1;
            const cx = scale.sx(fp);
            const cy = scale.sy(fp);
            return (
              <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ opacity: fade }}>
                {/* 待机光晕：独立元素，不与进/出冲突 */}
                {!reduce && (
                  <motion.circle
                    fill="none"
                    stroke="#34D399"
                    strokeWidth={1.5}
                    animate={{ cx, cy, r: [5, 12], opacity: [0.5, 0] }}
                    transition={{
                      cx: followSpring,
                      cy: followSpring,
                      r: { duration: 1.6, repeat: Infinity, ease: 'easeOut' },
                      opacity: { duration: 1.6, repeat: Infinity, ease: 'easeOut' },
                    }}
                  />
                )}
                {/* 实心点：cx/cy 弹簧跟手；诞生时 r 0→5 弹出 */}
                <motion.circle
                  fill="#34D399"
                  initial={{ r: reduce ? 5 : 0 }}
                  animate={{ cx, cy, r: 5 }}
                  transition={{ cx: followSpring, cy: followSpring, r: popSpring }}
                />
                {(isLeast || isGreatest) && (
                  <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill="#34D399">
                    {isLeast ? '最小' : '最大'}
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* 可拖控制点（通用原语 DragHandle） */}
        {centerPts.map((p, i) => (
          <DragHandle
            key={`anchor-${i}`}
            cx={scale.sx(p.x)}
            cy={scale.sy(p.y)}
            index={i}
            color={themeColor}
            axis="y"
            valueNow={p.y}
            active={draggingIndex === i}
            onPointerDown={startDrag}
          />
        ))}
      </svg>

      {/* 文字冗余读出 + 操作提示 */}
      <p className="mt-2 text-center text-xs font-medium text-emerald-300">{readout}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{VARIANT_HINT[variant]}</p>
    </div>
  );
}
