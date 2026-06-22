import { create } from 'zustand';

/**
 * 主视图状态（Zustand 切片，plan.md §五）。
 * 负责象限主视图 ↔ 深度探索视图的焦点切换、透视模式、环绕层可见性。
 * 严格切片化订阅：组件只取所需字段。
 */

type ViewMode = 'quadrant' | 'detail';
type Perspective = 'dual' | 'history' | 'math';

interface ViewState {
  /** 当前视图模式 */
  mode: ViewMode;
  /** 深度视图聚焦的理论支柱 id（mode=detail 时有效） */
  focusedTheory: string | null;
  /** 透视模式（mode=detail 时有效） */
  perspective: Perspective;
  /** 环绕层开关 */
  ringsVisible: boolean;
}

interface ViewActions {
  /** 进入单理论深度视图 */
  focusTheory: (id: string) => void;
  /** 返回四象限主视图 */
  goBack: () => void;
  /** 切换透视模式 */
  setPerspective: (p: Perspective) => void;
  /** 切换环绕层 */
  toggleRings: () => void;
}

export type ViewStore = ViewState & ViewActions;

export const useViewStore = create<ViewStore>((set) => ({
  mode: 'quadrant',
  focusedTheory: null,
  perspective: 'dual',
  ringsVisible: false,

  focusTheory: (id) =>
    set({ mode: 'detail', focusedTheory: id, perspective: 'dual' }),
  goBack: () => set({ mode: 'quadrant', focusedTheory: null }),
  setPerspective: (perspective) => set({ perspective }),
  toggleRings: () => set((s) => ({ ringsVisible: !s.ringsVisible })),
}));

/** 选择器：只订阅视图模式，供路由/过渡用 */
export const useViewMode = () => useViewStore((s) => s.mode);

/** 选择器：聚焦的理论 id */
export const useFocusedTheory = () => useViewStore((s) => s.focusedTheory);

/** 选择器：透视模式 */
export const usePerspective = () => useViewStore((s) => s.perspective);

/** 选择器：环绕层开关 */
export const useRingsVisible = () => useViewStore((s) => s.ringsVisible);
