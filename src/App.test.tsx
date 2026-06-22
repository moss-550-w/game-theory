import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import App from '@/App';
import { THEORIES } from '@/data';
import { useViewStore } from '@/store/viewStore';

describe('App 应用壳', () => {
  beforeEach(() => {
    // 重置 store 到初始状态，避免测试间相互影响
    useViewStore.setState({
      mode: 'quadrant',
      focusedTheory: null,
      perspective: 'dual',
      ringsVisible: false,
    });
  });

  it('渲染标题', () => {
    render(<App />);
    expect(screen.getByText('博弈论思想演进全景')).toBeInTheDocument();
  });

  it('四象限渲染四大理论支柱', () => {
    render(<App />);
    expect(THEORIES).toHaveLength(4);
    for (const t of THEORIES) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    }
  });

  it('聚焦理论支柱切换 viewStore 为 detail 模式', () => {
    const nash = THEORIES.find((t) => t.id === 'nash')!;
    useViewStore.getState().focusTheory(nash.id);

    expect(useViewStore.getState().mode).toBe('detail');
    expect(useViewStore.getState().focusedTheory).toBe('nash');
  });

  it('环绕层 toggleRings 可切换 ringsVisible', () => {
    expect(useViewStore.getState().ringsVisible).toBe(false);
    useViewStore.getState().toggleRings();
    expect(useViewStore.getState().ringsVisible).toBe(true);
    useViewStore.getState().toggleRings();
    expect(useViewStore.getState().ringsVisible).toBe(false);
  });
});
