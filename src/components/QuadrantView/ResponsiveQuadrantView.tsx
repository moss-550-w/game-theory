import { useBreakpoint } from '@/hooks/useBreakpoint';
import { QuadrantView } from './QuadrantView';
import { CardFlowView } from './CardFlowView';
import type { TheoryId } from '@/types';

interface ResponsiveQuadrantViewProps {
  onSelectTheory?: (id: TheoryId) => void;
  ringsVisible?: boolean;
  compareMode?: boolean;
  onToggleCompare?: (id: TheoryId) => void;
}

/**
 * 响应式四象限视图（design.md §8.3）。
 *
 * 断点策略：
 * - wide  (>1440px)：完整 SVG 四象限 + 环绕层
 * - desktop (1024-1440px)：完整 SVG 四象限，环绕层需手动开启
 * - tablet (768-1024px)：HTML 卡片流布局（失去象限空间隐喻，保留内容结构）
 * - mobile (<768px)：单列纵向滚动卡片
 */
export function ResponsiveQuadrantView(props: ResponsiveQuadrantViewProps) {
  const bp = useBreakpoint();

  if (bp === 'tablet' || bp === 'mobile') {
    return <CardFlowView {...props} stacked={bp === 'mobile'} />;
  }

  return <QuadrantView {...props} />;
}
