import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { THEORIES } from '@/data';

describe('App 应用壳', () => {
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

  it('点击象限后底部反馈所选支柱', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('尚未选择理论支柱')).toBeInTheDocument();

    const nash = THEORIES.find((t) => t.id === 'nash')!;
    await user.click(screen.getByRole('button', { name: new RegExp(nash.name) }));

    expect(screen.getByText(new RegExp(nash.oneLineDef))).toBeInTheDocument();
  });
});
