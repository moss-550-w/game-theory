import { THEORIES } from '@/data';
import type { TheoryId } from '@/types';

/** 理论支柱 → 主题色 的查找表（design.md §8.1）。 */
export const THEORY_COLOR: Record<TheoryId, string> = Object.fromEntries(
  THEORIES.map((t) => [t.id, t.themeColor]),
) as Record<TheoryId, string>;

const NEUTRAL = '#94A3B8';

export function colorOfTheory(id: TheoryId | undefined): string {
  return id ? (THEORY_COLOR[id] ?? NEUTRAL) : NEUTRAL;
}
