import { describe, expect, it, beforeEach } from 'vitest';
import { usePathStore, type MarkedNode } from '@/store/pathStore';

const TEST_NODE: Omit<MarkedNode, 'markedAt'> = {
  id: 'nash-proposal',
  label: '纳什均衡',
  theoryId: 'nash',
  type: 'history',
};

describe('pathStore', () => {
  beforeEach(() => {
    // 清除持久化数据
    usePathStore.setState({ markedNodes: [], notes: [] });
    localStorage.removeItem('game-theory-learning-path');
  });

  it('初始状态为空', () => {
    const state = usePathStore.getState();
    expect(state.markedNodes).toEqual([]);
    expect(state.notes).toEqual([]);
  });

  it('markNode 添加标记', () => {
    usePathStore.getState().markNode(TEST_NODE);
    expect(usePathStore.getState().markedNodes).toHaveLength(1);
    expect(usePathStore.getState().markedNodes[0].label).toBe('纳什均衡');
  });

  it('markNode 不重复添加相同 id', () => {
    usePathStore.getState().markNode(TEST_NODE);
    usePathStore.getState().markNode(TEST_NODE);
    expect(usePathStore.getState().markedNodes).toHaveLength(1);
  });

  it('toggleMarkNode 切换', () => {
    usePathStore.getState().toggleMarkNode(TEST_NODE);
    expect(usePathStore.getState().markedNodes).toHaveLength(1);
    usePathStore.getState().toggleMarkNode(TEST_NODE);
    expect(usePathStore.getState().markedNodes).toHaveLength(0);
  });

  it('unmarkNode 删除指定', () => {
    usePathStore.getState().markNode(TEST_NODE);
    usePathStore.getState().unmarkNode('other-id');
    expect(usePathStore.getState().markedNodes).toHaveLength(1);
  });

  it('addNote / removeNote', () => {
    usePathStore.getState().addNote('nash', '理解角谷证明');
    expect(usePathStore.getState().notes).toHaveLength(1);
    const note = usePathStore.getState().notes[0];
    expect(note.text).toBe('理解角谷证明');
    expect(note.theoryId).toBe('nash');
    usePathStore.getState().removeNote(note.id);
    expect(usePathStore.getState().notes).toHaveLength(0);
  });

  it('clearAll 清除全部', () => {
    usePathStore.getState().markNode(TEST_NODE);
    usePathStore.getState().addNote('nash', 'note');
    usePathStore.getState().clearAll();
    expect(usePathStore.getState().markedNodes).toEqual([]);
    expect(usePathStore.getState().notes).toEqual([]);
  });

  it('exportPath 生成 Markdown 文本', () => {
    usePathStore.getState().markNode(TEST_NODE);
    usePathStore.getState().addNote('nash', '我的笔记');
    const text = usePathStore.getState().exportPath();
    expect(text).toContain('# 博弈论学习路径导出');
    expect(text).toContain('纳什均衡');
    expect(text).toContain('我的笔记');
  });
});
