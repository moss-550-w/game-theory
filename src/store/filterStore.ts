import { create } from 'zustand';
import type { Tag, TheoryId } from '@/types';
import { APPLICATIONS } from '@/data';

/**
 * 筛选与对比状态（Zustand 切片，plan.md §五）。
 * 联动遵循「按需调用」原则：筛选变更不触发全局自动高亮，
 * 由 QuadrantView 等消费组件自行决定渲染策略。
 */

type FilterState = {
  /** 激活的理论属性标签（多选，AND 逻辑） */
  activeTags: Tag[];
  /** 选中的应用领域 id（单选） */
  activeApplication: string | null;
  /** 对比模式开关 */
  compareModeEnabled: boolean;
  /** 对比模式选中的理论 id（2+ 个，compareModeEnabled 为 true 时生效） */
  compareSelection: TheoryId[];
};

type FilterActions = {
  toggleTag: (tag: Tag) => void;
  clearTags: () => void;
  setApplication: (id: string | null) => void;
  toggleCompareMode: () => void;
  toggleCompare: (id: TheoryId) => void;
  clearCompare: () => void;
};

export type FilterStore = FilterState & FilterActions;

export const useFilterStore = create<FilterStore>((set) => ({
  activeTags: [],
  activeApplication: null,
  compareModeEnabled: false,
  compareSelection: [],

  toggleTag: (tag) =>
    set((s) => ({
      activeTags: s.activeTags.includes(tag)
        ? s.activeTags.filter((t) => t !== tag)
        : [...s.activeTags, tag],
    })),
  clearTags: () => set({ activeTags: [] }),
  setApplication: (id) => set({ activeApplication: id }),
  toggleCompareMode: () =>
    set((s) => {
      const next = !s.compareModeEnabled;
      return { compareModeEnabled: next, compareSelection: next ? [] : s.compareSelection };
    }),
  toggleCompare: (id) =>
    set((s) => ({
      compareSelection: s.compareSelection.includes(id)
        ? s.compareSelection.filter((x) => x !== id)
        : s.compareSelection.length >= 3
          ? [id]
          : [...s.compareSelection, id],
    })),
  clearCompare: () => set({ compareSelection: [] }),
}));

/** 选择器：激活标签集合 */
export const useActiveTags = () => useFilterStore((s) => s.activeTags);

/** 选择器：选中的应用领域 */
export const useActiveApplication = () => useFilterStore((s) => s.activeApplication);

/** 选择器：对比模式开关 */
export const useCompareModeEnabled = () => useFilterStore((s) => s.compareModeEnabled);

/** 选择器：对比选中的理论 id */
export const useCompareSelection = () => useFilterStore((s) => s.compareSelection);

/** 辅助：根据标签集合计算每个理论是否匹配 */
export function theoryMatchesTags(theoryTags: Tag[], activeTags: Tag[]): boolean {
  if (activeTags.length === 0) return true;
  return activeTags.every((t) => theoryTags.includes(t));
}

/** 辅助：根据应用领域获取关联理论 */
export function getTheoriesForApplication(appId: string): TheoryId[] {
  const app = APPLICATIONS.find((a) => a.id === appId);
  return app?.relatedTheories ?? [];
}
