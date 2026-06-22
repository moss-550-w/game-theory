import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import type { PlotScale } from '@/utils/plotting/scale';

export interface DraggableValuesOptions {
  /** 初始值序列（每个可拖控制点一个值，单位坐标 [0,1]）。 */
  initial: number[];
  /** 坐标换算器（提供像素↔单位映射）。 */
  scale: PlotScale;
  /** 拖拽轴：'y'（默认，纵向拖动）或 'x'（横向）。 */
  axis?: 'x' | 'y';
  /** 可选约束：每次更新后对整个值序列做后处理（如强制单调）。 */
  constrain?: (values: number[]) => number[];
}

export interface DraggableValues {
  /** 绑定到 SVG 元素的 ref（用于读取边界做像素换算）。 */
  svgRef: React.RefObject<SVGSVGElement>;
  /** 当前值序列。 */
  values: number[];
  /** 直接设置值序列（会经过 constrain）。 */
  setValues: (next: number[]) => void;
  /** 正在拖拽的控制点索引，未拖拽为 null。 */
  draggingIndex: number | null;
  /** 在控制点上触发：开始拖拽第 idx 个值。 */
  startDrag: (idx: number, e: ReactPointerEvent) => void;
  /** 展开到 SVG 容器上的指针事件处理器（move/up/leave）。 */
  containerHandlers: {
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
    onPointerLeave: (e: ReactPointerEvent) => void;
  };
}

/**
 * 可拖控制点的拖拽机制（数学交互件通用原语，planv2.md「复用性」）。
 *
 * 负责：指针捕获、像素→单位换算、可选约束（如塔斯基单调）、拖拽态。
 * 不负责任何绘制——把 values 交给调用方决定如何呈现曲线/带/不动点。
 *
 * 后续支柱可直接复用：下包络（拖对手收益线）、最优反应交点（拖策略）、
 * 贝叶斯面积（拖似然）。axis 决定拖 x 还是 y。
 */
export function useDraggableValues({
  initial,
  scale,
  axis = 'y',
  constrain,
}: DraggableValuesOptions): DraggableValues {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const apply = useCallback(
    (vals: number[]) => (constrain ? constrain(vals) : vals),
    [constrain],
  );
  const [values, setRaw] = useState<number[]>(() => apply([...initial]));
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const setValues = useCallback((next: number[]) => setRaw(apply(next)), [apply]);

  /** 把指针事件换算成该轴上的单位值。 */
  const valueFromPointer = useCallback(
    (e: ReactPointerEvent): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      if (axis === 'x') {
        const px = ((e.clientX - rect.left) / rect.width) * scale.view;
        return scale.invX(px);
      }
      const py = ((e.clientY - rect.top) / rect.height) * scale.view;
      return scale.invY(py);
    },
    [axis, scale],
  );

  const startDrag = useCallback((idx: number, e: ReactPointerEvent) => {
    dragIdx.current = idx;
    setDraggingIndex(idx);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const idx = dragIdx.current;
      if (idx === null) return;
      setRaw((prev) => {
        const next = prev.slice();
        next[idx] = valueFromPointer(e);
        return apply(next);
      });
    },
    [apply, valueFromPointer],
  );

  const endDrag = useCallback((e: ReactPointerEvent) => {
    if (dragIdx.current === null) return;
    dragIdx.current = null;
    setDraggingIndex(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  return {
    svgRef,
    values,
    setValues,
    draggingIndex,
    startDrag,
    containerHandlers: {
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
    },
  };
}
