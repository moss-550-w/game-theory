import { THEORIES } from '@/data';

/**
 * 应用壳（M0）。
 * 当前仅渲染四大支柱占位卡片，验证脚手架与主题色 token 生效；
 * M2 将替换为正式的 QuadrantView 四象限主视图。
 */
export default function App() {
  return (
    <div className="min-h-screen bg-canvas-bg text-slate-100">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-wide">
          博弈论思想演进全景
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          以四大理论支柱为骨架的可视化交互应用 · 脚手架就绪
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {THEORIES.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-white/10 bg-canvas-panel p-5"
              style={{ borderLeft: `4px solid ${t.themeColor}` }}
            >
              <h2 className="text-base font-medium">{t.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{t.scene}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
