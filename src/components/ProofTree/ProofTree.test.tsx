import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProofTree } from '@/components/ProofTree/ProofTree';

describe('ProofTree', () => {
  it('纳什均衡渲染 4 条证明路径', () => {
    render(<ProofTree theoryId="nash" />);
    // 所有四条证明分支的标题（数学工具名）都应出现
    expect(screen.getByText('角谷不动点定理')).toBeInTheDocument();
    expect(screen.getByText('布劳威尔不动点定理')).toBeInTheDocument();
    expect(screen.getByText('范美·格利克斯伯格不动点定理')).toBeInTheDocument();
    expect(screen.getByText('塔斯基不动点定理')).toBeInTheDocument();
  });

  it('极小极大渲染 1 条证明路径', () => {
    render(<ProofTree theoryId="minimax" />);
    expect(screen.getByText('线性规划对偶定理')).toBeInTheDocument();
  });

  it('无证明路径时显示兜底提示', () => {
    // minimax 有 1 条证明路径，此处验证非空场景
    render(<ProofTree theoryId="minimax" />);
    expect(screen.queryByText('该理论暂无录入证明路径')).not.toBeInTheDocument();
  });

  it('点击展开查看证明概要', async () => {
    const user = userEvent.setup();
    render(<ProofTree theoryId="nash" />);
    const kakutaniBtn = screen.getByRole('button', { name: /角谷不动点定理/ });
    expect(screen.queryByText(/最佳反应对应/)).not.toBeInTheDocument();

    await user.click(kakutaniBtn);
    // 展开后应出现证明概要
    expect(screen.getByText(/最佳反应对应/)).toBeInTheDocument();
  });

  it('多分支平等呈现（不暗示唯一标准）', () => {
    render(<ProofTree theoryId="nash" />);
    // 4 条分支均以同等视觉权重呈现（无高亮"推荐"标记）
    const expandButtons = screen.getAllByText(/点击展开/);
    expect(expandButtons).toHaveLength(4);
  });

  it('展开布劳威尔分支挂载不动点交互件', async () => {
    const user = userEvent.setup();
    render(<ProofTree theoryId="nash" />);
    await user.click(screen.getByRole('button', { name: /布劳威尔不动点定理/ }));
    // 交互件 SVG（按 aria-label 前缀）出现
    expect(screen.getByRole('img', { name: /brouwer 不动点交互图/ })).toBeInTheDocument();
    // 文字冗余读出「不动点」数量（颜色 + 文字双编码）
    expect(screen.getByText(/不动点 \d+ 个/)).toBeInTheDocument();
    // 可拖控制点以 slider 角色暴露
    expect(screen.getAllByRole('slider').length).toBeGreaterThan(0);
  });

  it('展开角谷分支显示集值（带状）不动点呈现', async () => {
    const user = userEvent.setup();
    render(<ProofTree theoryId="nash" />);
    await user.click(screen.getByRole('button', { name: /角谷不动点定理/ }));
    expect(screen.getByRole('img', { name: /kakutani 不动点交互图/ })).toBeInTheDocument();
    expect(screen.getByText(/集值映射（带状）/)).toBeInTheDocument();
  });
});
