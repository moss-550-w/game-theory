import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import { THEORIES } from '@/data';

describe('App 应用壳', () => {
  it('渲染标题', () => {
    render(<App />);
    expect(screen.getByText('博弈论思想演进全景')).toBeInTheDocument();
  });

  it('渲染四大理论支柱', () => {
    render(<App />);
    expect(THEORIES).toHaveLength(4);
    for (const t of THEORIES) {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    }
  });
});
