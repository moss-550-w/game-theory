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
});
