/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 四大理论支柱主题色（design.md §8.1）
        theory: {
          minimax: '#1A5276', // 极小极大定理 · 深海蓝
          nash: '#6C3483', // 纳什均衡 · 深紫
          backward: '#1D8348', // 逆向归纳均衡 · 墨绿
          bayesian: '#D68910', // 贝叶斯均衡 · 暖橙
        },
        canvas: {
          bg: '#0B1020', // 星云式深色背景
          panel: '#141B2E',
        },
      },
      transitionTimingFunction: {
        // design.md §8.2：象限切换缓出
        'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        quadrant: '500ms', // 象限切换 0.5s
      },
    },
  },
  plugins: [],
};
