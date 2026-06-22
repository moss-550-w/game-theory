import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TheoryId } from '@/types';

/**
 * 学习路径状态（Zustand 切片 + persist，plan.md §五 / design.md §6.2）。
 * 持久化到 localStorage，支持标记关键节点、添加笔记、导出与回看。
 */

export interface MarkedNode {
  id: string;
  label: string;
  theoryId: TheoryId;
  type: 'history' | 'math' | 'proof';
  markedAt: number; // timestamp
}

export interface NoteEntry {
  id: string;
  theoryId: TheoryId;
  text: string;
  createdAt: number;
}

interface PathState {
  markedNodes: MarkedNode[];
  notes: NoteEntry[];
}

interface PathActions {
  markNode: (node: Omit<MarkedNode, 'markedAt'>) => void;
  unmarkNode: (id: string) => void;
  toggleMarkNode: (node: Omit<MarkedNode, 'markedAt'>) => void;
  addNote: (theoryId: TheoryId, text: string) => void;
  removeNote: (id: string) => void;
  clearAll: () => void;
  /** 导出学习路径为可读文本 */
  exportPath: () => string;
}

export type PathStore = PathState & PathActions;

export const usePathStore = create<PathStore>()(
  persist(
    (set, get) => ({
      markedNodes: [],
      notes: [],

      markNode: (node) =>
        set((s) => ({
          markedNodes: s.markedNodes.some((n) => n.id === node.id)
            ? s.markedNodes
            : [...s.markedNodes, { ...node, markedAt: Date.now() }],
        })),
      unmarkNode: (id) =>
        set((s) => ({
          markedNodes: s.markedNodes.filter((n) => n.id !== id),
        })),
      toggleMarkNode: (node) =>
        set((s) => ({
          markedNodes: s.markedNodes.some((n) => n.id === node.id)
            ? s.markedNodes.filter((n) => n.id !== node.id)
            : [...s.markedNodes, { ...node, markedAt: Date.now() }],
        })),
      addNote: (theoryId, text) =>
        set((s) => ({
          notes: [
            ...s.notes,
            { id: `note-${Date.now()}`, theoryId, text, createdAt: Date.now() },
          ],
        })),
      removeNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ markedNodes: [], notes: [] }),
      exportPath: () => {
        const { markedNodes, notes } = get();
        const lines: string[] = [];
        lines.push('# 博弈论学习路径导出');
        lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`);
        lines.push('');

        lines.push('## 标记的关键节点');
        if (markedNodes.length === 0) {
          lines.push('（无）');
        } else {
          const byTheory = new Map<TheoryId, MarkedNode[]>();
          for (const n of markedNodes) {
            const list = byTheory.get(n.theoryId) ?? [];
            list.push(n);
            byTheory.set(n.theoryId, list);
          }
          for (const [theoryId, nodes] of byTheory) {
            lines.push(`\n### ${theoryId}`);
            for (const n of nodes) {
              lines.push(`- [${n.type}] ${n.label}`);
            }
          }
        }

        lines.push('\n## 学习笔记');
        if (notes.length === 0) {
          lines.push('（无）');
        } else {
          for (const note of notes) {
            lines.push(`\n### [${note.theoryId}] ${new Date(note.createdAt).toLocaleDateString('zh-CN')}`);
            lines.push(note.text);
          }
        }

        return lines.join('\n');
      },
    }),
    {
      name: 'game-theory-learning-path',
      partialize: (state) => ({
        markedNodes: state.markedNodes,
        notes: state.notes,
      }),
    },
  ),
);

/** 选择器：标记的节点列表 */
export const useMarkedNodes = () => usePathStore((s) => s.markedNodes);

/** 选择器：笔记列表 */
export const useNotes = () => usePathStore((s) => s.notes);
