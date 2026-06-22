import { useFilterStore } from '@/store/filterStore';
import { APPLICATIONS } from '@/data';
import type { Tag } from '@/types';

/** 所有可用标签的中文映射 */
const TAG_META: Record<Tag, { label: string; color: string }> = {
  'cooperative': { label: '合作', color: '#38BDF8' },
  'non-cooperative': { label: '非合作', color: '#F472B6' },
  'static': { label: '静态', color: '#A78BFA' },
  'dynamic': { label: '动态', color: '#34D399' },
  'complete-info': { label: '完全信息', color: '#FBBF24' },
  'incomplete-info': { label: '不完全信息', color: '#FB923C' },
  'zero-sum': { label: '零和', color: '#EF4444' },
  'non-zero-sum': { label: '非零和', color: '#22D3EE' },
};

/**
 * 标签筛选栏（design.md §5.1）。
 * 多选 pills，AND 逻辑：只有携带全部激活标签的理论保留高亮。
 * 点击已激活标签取消选择；点击「清除」重置。
 */
export function TagFilter() {
  const activeTags = useFilterStore((s) => s.activeTags);
  const toggleTag = useFilterStore((s) => s.toggleTag);
  const clearTags = useFilterStore((s) => s.clearTags);

  const hasFilter = activeTags.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-slate-500 mr-1">属性筛选：</span>
      {(Object.keys(TAG_META) as Tag[]).map((tag) => {
        const isActive = activeTags.includes(tag);
        const meta = TAG_META[tag];
        return (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            aria-pressed={isActive}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'border-current text-white'
                : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
            }`}
            style={isActive ? { borderColor: meta.color, backgroundColor: meta.color + '33', color: meta.color } : undefined}
          >
            {meta.label}
          </button>
        );
      })}
      {hasFilter && (
        <button
          onClick={clearTags}
          className="rounded-full px-2 py-1 text-xs text-slate-500 transition-colors hover:text-white"
        >
          清除
        </button>
      )}
    </div>
  );
}

/**
 * 应用领域筛选（design.md §5.2）。
 * 单选下拉：选择后高亮关联理论 + 时间环上对应节点。
 */
export function ApplicationFilter() {
  const activeApp = useFilterStore((s) => s.activeApplication);
  const setApplication = useFilterStore((s) => s.setApplication);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">应用领域：</span>
      <select
        value={activeApp ?? ''}
        onChange={(e) => setApplication(e.target.value || null)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 outline-none transition-colors focus:border-white/30"
      >
        <option value="">全部</option>
        {APPLICATIONS.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * 对比模式切换 + 选中指示器（design.md §4.2）。
 * 开启后点击象限可在 compareSelection 中累积（最多 3 个），
 * 屏幕中央弹出并列卡片。
 */
export function CompareModeToggle() {
  const compareSelection = useFilterStore((s) => s.compareSelection);
  const compareModeEnabled = useFilterStore((s) => s.compareModeEnabled);
  const toggleCompareMode = useFilterStore((s) => s.toggleCompareMode);
  const clearCompare = useFilterStore((s) => s.clearCompare);
  const isActive = compareModeEnabled && compareSelection.length >= 2;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleCompareMode}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          isActive
            ? 'border-white/30 bg-white/15 text-white'
            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
        }`}
        title="开启后点击象限可选中理论进行对比"
      >
        对比模式 {isActive ? `(${compareSelection.length})` : ''}
      </button>
      {isActive && (
        <button
          onClick={clearCompare}
          className="rounded-lg px-2 py-1.5 text-xs text-slate-500 transition-colors hover:text-white"
        >
          清除
        </button>
      )}
    </div>
  );
}
