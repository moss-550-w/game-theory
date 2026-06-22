# Plan v2：让数学"可被手破坏"——证明树不动点交互件

## Context（为什么做这件事）

当前应用的数学呈现是**两极分化**的：

- **模拟器**（`src/components/Simulators/`）已有动画，但多为**一次性入场**（`MixedStrategy.tsx:145` 的 `pathLength: 0→1`），滑杆改变时数值更新、几何洞见不更新——它告诉你"均衡点在这"，没让你看见它"为什么非在这不可"。
- **证明树**（`src/components/ProofTree/ProofTree.tsx`）是**纯文字卡片**（适用条件 / 优劣 / 证明概要 / 类比）。最该被动画化的部分——布劳威尔、角谷、塔斯基、范美·格利克斯伯格四条**不动点定理**证明路径——目前一帧动画都没有。

v2 的目标是为"如何体现对数学的直观动画交互"给出**第一个可落地、可复用的范式**：把抽象命题换成一个**能被用户的手破坏、再看它自我恢复的几何不变量**。第一刀切在证明树的不动点定理——因为它填的是最大空白，且一个组件能同时服务四条分支。

核心设计原则（贯穿后续所有数学交互件）：

1. **可操作的不变量**——用户拖参数，盯着那个"怎么拽都拽不走、一松手就在的点"。数学事实 = 那个不变量。
2. **几何替身**——用一个几何对象替代符号命题，它的某个性质*就是*定理本身。
3. **可逆、可放慢的过程**——迭代/归纳/更新逐步播放、可倒放（本期不动点件用"拖动即重算"实现）。

不动点定理的几何替身：连续映射 `f:[0,1]→[0,1]` 画成曲线 + 对角线 `y=x`，**交点 = 不动点**。无论用户怎么拖曲线，只要它连续且落在单位方块内，交点**永远存在**——这就是布劳威尔定理的体感。

---

## 第一交付物：`FixedPointWidget`（证明树内嵌交互件）

### 放置位置

`ProofTree` 渲染于 `TheoryDetail` 的"数学"透视下，宿主容器 `TheoryDetail.tsx:304` 当前为 `mt-4 max-h-48 overflow-y-auto`（192px，过矮，且滚动会与拖拽冲突）。

- 在 `ProofBranch` 展开内容（`ProofTree.tsx:101` 的 `motion.div` 内、文字字段之后）按需挂载 `<FixedPointWidget>`，仅当 `tool.id ∈ {brouwer, kakutani, tarski, fan-glicksberg}` 时渲染。
- 把宿主容器 `max-h-48` 放宽到约 `max-h-[60vh]`，让 ~300px 的交互件不被裁剪/吞滚动。拖拽手柄设置 `touch-action: none`，避免触屏下拖拽被滚动劫持。

### 四变体映射（一个组件，`variant` prop 驱动差异）

| 证明分支 id | tool.id | variant 行为 | 几何呈现 |
|---|---|---|---|
| `nash-existence-brouwer` | `brouwer` | 单值连续映射，≥1 交点 | 一条可拖曲线 ∩ 对角线 |
| `nash-existence-kakutani` | `kakutani` | 集值（上半连续凸值）对应 | 一条"带子"跨过对角线 → 集值不动点 |
| `nash-existence-tarski` | `tarski` | 单调非减映射（格上） | 约束控制点单调；高亮**最小/最大**不动点 |
| `nash-existence-fan-glicksberg` | `fan-glicksberg` | 连续策略空间推广 | 复用 kakutani 带子渲染 + 文案标注"策略空间为连续统" |

（分支与 toolId 已在 `src/data/proofs.yaml` / `math.yaml` 中确认存在，全部 `conclusionId: nash-existence`，归属理论 `nash`。）

### 交互规格

- SVG 单位方块 `[0,1]²` 绘图区，对角线 `y=x`（虚线）。
- 曲线由 4–5 个**可拖控制点**定义，分段插值后**钳制到 [0,1]**（保证确为自映射）。
- 拖动任一控制点 → 曲线与不动点**实时重算**；不动点用脉冲圆点 + "不动点" 文字标注。
- "拽不掉"演示：因连续自映射必有 `f(0)≥0、f(1)≤1`，交点恒存在；用户把曲线推到边界时被钳制，交点仍在。
- 一行操作提示："拖动控制点改变映射，观察不动点如何始终存在"。

---

## 文件改动清单

### 新增

1. **`src/utils/solvers/fixedPoint.ts`**（纯函数，遵循现有 solver 约定 `(input)=>output`）
   - `Pt = { x: number; y: number }`
   - `evalCurve(points: Pt[], x: number): number` — 分段线性（或单调三次）插值，钳制 [0,1]
   - `findFixedPoints(points: Pt[], samples = 200): number[]` — 采样 `g(x)=f(x)-x`，检测变号区间并二分细化
   - `clampMonotone(points: Pt[]): Pt[]` — tarski 变体用，强制 y 非减
   - `findSetValuedFixedPoints(lower: Pt[], upper: Pt[]): number[]` — kakutani/fan-glicksberg 带子与对角线相交区间
   - `DEFAULT_CURVE[variant]` — 各变体默认控制点
   - **不引入 Web Worker**：与现有 solver 一致，运算 O(samples) 量级，纯函数同步即可（符合 CLAUDE.md 第 83 行"纯函数"路线）。

2. **`src/components/ProofTree/FixedPointWidget.tsx`**
   - Props：`{ variant: 'brouwer'|'kakutani'|'tarski'|'fan-glicksberg'; themeColor: string; analogy?: string }`
   - 本地 `useState` 保存控制点；指针事件（`onPointerDown/Move/Up`）实现拖拽，屏幕坐标↔单位坐标转换参考 `MixedStrategy.tsx:50-57` 的 scale 写法。
   - 复用 Framer Motion 既有手法：`motion.path`（曲线 draw-in）、`motion.circle`（不动点脉冲）。
   - `useReducedMotion()`（framer-motion）→ 命中时关闭脉冲/绘制动画，仅静态呈现（项目当前尚无 `prefers-reduced-motion` 处理，本件补上）。
   - 无障碍：SVG 加 `aria-label`；在 SVG 外用文字冗余读出当前不动点数值与个数（颜色+文字双编码，符合 CLAUDE.md 第 84 行）。

### 修改

3. **`src/components/ProofTree/ProofTree.tsx`**
   - `ProofBranchProps.tool` 类型加上 `id`（`getProofsForTheory` 返回的本就是完整 `MathTool`，含 `id`，仅类型声明需放宽）。
   - 在展开内容末尾按 `tool.id` 条件挂载 `<FixedPointWidget>`，传入 `themeColor` 与 `branch.analogy`。

4. **`src/components/TheoryDetail/TheoryDetail.tsx`**
   - 第 304 行宿主容器 `max-h-48` → `max-h-[60vh]`（或等效），使交互件有展开空间。

---

## 复用性（为后续支柱铺路）

`FixedPointWidget` 沉淀的三件原语——**可拖 SVG 控制点 + 实时重算 + 不变量标记**——将直接复用于其余支柱（后续计划，不在本期范围）：

- **极小极大**：对手纯策略收益线的**下包络**，maximin = 包络峰值（拖我方概率 p）。
- **纳什均衡**：两条最优反应阶梯曲线的**交点**；或最优反应动态的蛛网轨迹。
- **贝叶斯均衡**：Bayes 面积矩形，先验随似然滑杆**实时重塑**为后验。

建议在本期顺带把通用绘图原语（scale/axis/grid、可拖控制点 hook）抽到 `src/components/ui/` 或 `src/utils/plotting/`（当前 `ui/` 仅有 `.gitkeep`，绘图均为各组件手搓）——但保持最小化，优先内联实现，待第二个交互件出现时再抽象，避免过早抽象。

---

## 验证

1. **单元测试**（`src/utils/solvers/solvers.test.ts` 追加，Vitest 纯函数风格）：
   - `evalCurve` 端点/钳制正确；
   - `findFixedPoints`：恒等线返回连续解的代表值；单次穿越对角线返回 1 个不动点；无变号时的边界行为；
   - `clampMonotone` 输出非减；
   - `findSetValuedFixedPoints` 带子跨对角线返回区间。
2. **组件测试**（`src/components/ProofTree/ProofTree.test.tsx` 追加，RTL + `userEvent`，沿用现有 `getByText/getByRole` 风格、不依赖 data-testid）：
   - 渲染 `theoryId="nash"`，展开"布劳威尔不动点定理"分支 → 断言交互件 SVG（按 `aria-label`）与"不动点"文字出现；
   - 角谷分支展开 → 断言带子/集值文案出现。
3. **E2E（可选，低优先）**：`e2e/app.spec.ts` 追加——进入纳什 → 切"数学"透视 → 展开布劳威尔 → 交互件可见（沿用文本/角色选择器）。
4. **手动**：`npm run dev`，纳什理论 → 数学透视 → 展开各不动点分支，拖动控制点确认不动点实时跟随且始终存在；`prefers-reduced-motion` 开启时无脉冲动画。
5. 跑 `npm run test`（Vitest）确保新旧测试全绿；`npm run lint` 无新增告警。

---

## 不做（本期边界）

- 不实现其余三支柱的交互件（仅在"复用性"中规划）。
- 不新增全屏 `FixedPointSimulator`（保持内嵌于证明树，符合用户原始意图；全屏化留作可选后续）。
- 不引入新依赖、不接入 Web Worker。
