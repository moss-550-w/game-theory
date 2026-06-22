import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointSimulator } from './FixedPoint';

describe('FixedPointSimulator', () => {
  it('渲染标题与默认布劳威尔交互图', () => {
    render(<FixedPointSimulator />);
    expect(screen.getByText('不动点定理交互验证')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /brouwer 不动点交互图/ })).toBeInTheDocument();
    // 可拖控制点暴露为 slider
    expect(screen.getAllByRole('slider').length).toBeGreaterThan(0);
  });

  it('切换到角谷变体显示集值（带状）交互图', async () => {
    const user = userEvent.setup();
    render(<FixedPointSimulator />);
    await user.click(screen.getByRole('button', { name: /角谷不动点定理/ }));
    expect(screen.getByRole('img', { name: /kakutani 不动点交互图/ })).toBeInTheDocument();
    expect(screen.getByText(/集值映射（带状）/)).toBeInTheDocument();
  });

  it('四条证明路径均可选', () => {
    render(<FixedPointSimulator />);
    for (const name of [/布劳威尔不动点定理/, /角谷不动点定理/, /塔斯基不动点定理/, /范美·格利克斯伯格不动点定理/]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
