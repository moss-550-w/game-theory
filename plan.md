# Plan.md — 博弈论思想演进可视化应用 · 实施计划

> 本文件将 `design.md`（交互设计方案）与 `claude.md`（技术架构与约定）落地为可执行的工程计划。
> 以**里程碑（Milestone）**为单位推进，每个里程碑交付一个可演示的纵向切片，避免一次性堆砌。

---

## 一、总体路线图

| 阶段 | 里程碑 | 核心交付物 | 可演示成果 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| M0 | 工程脚手架 | Vite + React + TS + Tailwind + Zustand 骨架，CI 雏形 | 空白应用可本地运行与构建 | ✅ 完成 |
| M1 | 数据层与类型系统 | 知识库 YAML schema、TS 类型、加载与校验 | 数据可被导入并通过类型校验 | ✅ 完成 |
| M2 | 四象限主视图（静态） | QuadrantView 布局、四支柱锚定、主题色 | 看到四象限版图与四大支柱 | ✅ 完成 |
| M3 | 关系箭头 + 环绕层 | 继承/批判箭头、时间环、应用环（可开关） | 主视图叙事主干完整呈现 | ✅ 完成 |
| M4 | 深度探索视图 | 象限点击 → 双重螺旋（历史线 / 数学线 + 交叉连线） | 单理论深度视图可进入与返回 | ✅ 完成 |
| M5 | 透视模式 + 证明树 | 三种透视模式、多分支证明树（展开/收起） | 数学聚焦模式下浏览多证明路径 | ⏭ 下一步 |
| M6 | 联动与筛选 | 标签筛选、应用领域筛选、应用历程卡片、对比模式 | 按需联动与对比演示 | 待开始 |
| M7 | 模拟器模块 | 囚徒困境 / 逆向归纳 / 混合策略（全屏独立） | 三个交互模拟器可玩 | 待开始 |
| M8 | 详情面板 + 学习路径 | 分层可拖拽卡片、笔记、路径保存与导出 | 完整探索闭环 | 待开始 |
| M9 | 打磨与交付 | 动效、响应式、色觉无障碍、E2E、Vercel 部署 | 上线预览链接 | 待开始 |

> 原则：**先骨架后血肉**——M2~M4 先用占位/最小数据跑通交互，M1 的内容填充与各阶段并行迭代。

---

## 二、技术栈与版本（来自 claude.md，锁定）

- 框架：React 18 + TypeScript 5
- 构建：Vite 5
- 可视化：D3.js v7（布局计算）+ `@visx/visx`（React 集成）
- 渲染：SVG（主视图 / 低节点数）+ Canvas（大规模证明树节点）
- 动画：Framer Motion 10+
- 状态：Zustand（切片化 + persist 持久化学习路径）
- 样式：Tailwind CSS 3 + Radix UI（无样式组件）
- 数据：YAML/JSON 知识库，Vite 导入
- 测试：Vitest + React Testing Library + Playwright（E2E）
- 部署：Vercel（预览分支 + CI/CD）

---

## 三、目录结构（基于 claude.md 约定细化）

```
src/
├── components/
│   ├── QuadrantView/        # 四象限主视图（M2/M3）
│   │   ├── QuadrantView.tsx
│   │   ├── QuadrantCell.tsx
│   │   ├── RelationArrows.tsx
│   │   ├── TimeRing.tsx
│   │   └── ApplicationRing.tsx
│   ├── TheoryDetail/        # 单理论深度视图 · 双重螺旋（M4/M5）
│   │   ├── TheoryDetail.tsx
│   │   ├── HistoryTrack.tsx
│   │   ├── MathTrack.tsx
│   │   ├── CrossLinks.tsx
│   │   └── PerspectiveToggle.tsx
│   ├── ProofTree/           # 多分支证明树（M5）
│   ├── Simulators/          # 模拟器（M7）
│   │   ├── PrisonersDilemma/
│   │   ├── BackwardInduction/
│   │   └── MixedStrategy/
│   ├── Filters/             # 筛选与对比（M6）
│   │   ├── TagFilter.tsx
│   │   ├── ApplicationFilter.tsx
│   │   └── CompareMode.tsx
│   ├── DetailPanel/         # 分层卡片 + 笔记（M8）
│   └── ui/                  # 通用组件（基于 Radix）
├── data/                    # 知识库（M1）
│   ├── theories.yaml        # 四大支柱
│   ├── events.yaml          # 历史节点
│   ├── math.yaml            # 数学工具与定理
│   ├── proofs.yaml          # 证明路径树
│   ├── applications.yaml    # 应用领域
│   └── relations.yaml       # 理论间继承/批判关系
├── hooks/                   # useTheorySelection、useFilter 等
├── store/                   # Zustand 切片
│   ├── viewStore.ts         # 主视图/深度视图焦点、透视模式
│   ├── filterStore.ts       # 标签/应用筛选
│   └── pathStore.ts         # 学习路径（persist）
├── utils/
│   ├── layout/              # D3 象限/环/螺旋布局计算（纯函数）
│   ├── solvers/             # 模拟器求解（纯函数 / Web Worker）
│   └── dataLoader.ts        # YAML 导入 + 运行时校验
├── workers/                 # 求解 Web Worker
├── styles/                  # Tailwind 配置扩展、主题色 token
└── types/                   # 全局类型定义
```

---

## 四、数据模型设计（M1 重点）

知识库**解耦维护**：理论、事件、数学、证明、应用、关系各自独立文件，通过 id 互相引用。

### 4.1 核心类型（`src/types/`）

```ts
type TheoryId = 'minimax' | 'nash' | 'backward-induction' | 'bayesian';

interface Theory {
  id: TheoryId;
  name: string;
  quadrant: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  themeColor: string;              // 主题色（见 §6）
  oneLineDef: string;              // 一句话定义
  coreAssumptions: string[];
  equilibriumCondition: string;
  tags: Tag[];                     // 合作/非合作、静/动、信息、零和
  scene: string;                   // 核心解决场景
}

interface HistoryNode {
  id: string;
  theoryId: TheoryId;
  role: 'precursor' | 'proposal' | 'refinement' | 'extension';
  year: number;
  title: string;
  contributor: string;
  contribution: string;            // 一句话贡献
}

interface MathTool {
  id: string;
  layer: 'foundation' | 'core-theorem' | 'application' | 'refinement';
  name: string;
  description: string;
}

interface ProofBranch {              // 多分支证明树节点
  id: string;
  conclusionId: string;            // 所证结论（如 nash-existence）
  toolId: string;                  // 依赖的数学工具
  applicability: string;           // 适用条件
  prosCons: string;                // 优劣
  summary: string;                 // 证明概要
  analogy?: string;                // 生活化类比版
  children?: string[];             // 子分支 id
}

interface Relation {                 // 理论间关系（核心叙事主干）
  from: TheoryId;
  to: TheoryId;
  kind: 'generalization' | 'refinement' | 'transformation' | 'fusion';
  style: 'solid' | 'dashed';
  label: string;                   // 如“从零和到非零和的推广”
  year: number;
  author: string;
}

interface CrossLink {                // 历史需求 ↔ 数学工具 映射
  historyNodeId: string;
  mathToolId: string;
  label: string;                   // “从角谷不动点定理借来存在性证明”
}

interface Application {
  id: string;
  name: string;                    // 拍卖/军控/演化生物学…
  relatedTheories: TheoryId[];     // 一对多
  milestones: { year: number; title: string }[];
}
```

### 4.2 校验策略

- 用 `zod` 在 `dataLoader.ts` 中对导入的 YAML 做运行时校验，schema 与 TS 类型单一来源（`z.infer`）。
- 引用完整性检查：所有 `theoryId` / `toolId` / `conclusionId` 必须能解析到已存在实体；CI 中跑一个 `data:validate` 脚本，断链即失败。

---

## 五、状态管理设计（Zustand 切片）

| Store | 关键状态 | 说明 |
| :--- | :--- | :--- |
| `viewStore` | `mode: 'quadrant' \| 'detail'`、`focusedTheory`、`perspective: 'dual' \| 'history' \| 'math'`、`ringsVisible` | 主视图 ↔ 深度视图焦点切换 |
| `filterStore` | `activeTags`、`activeApplication`、`compareSelection` | 筛选与对比模式选择集 |
| `pathStore` | `markedNodes`、`notes` | **persist 持久化**，学习路径保存/导出 |

- 严格遵循**切片化订阅**：组件只订阅所需切片，避免无关重渲染。
- 联动遵循 design.md 的「**按需调用**」原则：状态变更不触发全局自动高亮，由用户操作（点击卡片按钮）显式驱动跳转。

---

## 六、视觉规范落地（来自 design.md §8）

主题色作为 Tailwind / CSS 变量 token 集中定义：

| 理论 | 主题色 | 色值 |
| :--- | :--- | :--- |
| 极小极大定理 | 深海蓝 | `#1A5276` |
| 纳什均衡 | 深紫 | `#6C3483` |
| 逆向归纳均衡 | 墨绿 | `#1D8348` |
| 贝叶斯均衡 | 暖橙 | `#D68910` |

动效与无障碍约定（贯穿各里程碑、claude.md 强制项）：
- 象限切换 0.5s 缩放+位移缓出；双重螺旋 0.3s 间隔依次显现。
- 关联高亮用**发光边缘 + 降饱和**，禁止用 30% 透明度。
- 所有主题色经**色觉障碍模拟验证**；关键状态变化提供**形状/标签冗余编码**。

---

## 七、各里程碑任务拆解

### M0 · 工程脚手架
- `npm create vite` (react-ts)，接入 Tailwind、Radix、Zustand、Framer Motion、D3、visx、zod。
- 配置路径别名（`@/`）、ESLint/Prettier、Vitest、Playwright。
- 建立 `tailwind.config` 主题色 token 与基础布局壳。
- 验收：`dev` / `build` / `test` 三命令均通过，空应用可访问。

### M1 · 数据层与类型系统
- 定义 `src/types` 全部接口与 zod schema。
- 编写 `data/*.yaml`：先填**四大支柱 + 关系**（最小可用），其余留种子样例。
- 实现 `dataLoader.ts` + `data:validate` 校验脚本。
- 验收：数据通过校验，单测覆盖断链检测。

### M2 · 四象限主视图（静态）
- `utils/layout` 用 D3 计算象限坐标；`QuadrantView` 渲染 SVG 四象限 + 渐变模糊边界。
- 四支柱锚定各象限，应用主题色，悬停态。
- 验收：四象限版图与四支柱正确呈现，含坐标轴语义标签。

### M3 · 关系箭头 + 环绕层
- `RelationArrows`：四条永久箭头（含虚线双向），标注 label（推广/精炼/转换/融合）。
- `TimeRing` / `ApplicationRing`：弧形刻度节点，可独立开关（`ringsVisible`）。
- 验收：叙事主干箭头与两环可见且可开关。

### M4 · 深度探索视图（双重螺旋）
- 象限点击 → `viewStore` 切 `detail` 焦点，象限放大居中（Framer Motion 补间）。
- `HistoryTrack`（左·时间纵轴非等比）+ `MathTrack`（右·数学层次）。
- `CrossLinks`：历史节点 ↔ 数学工具 精确连线与标注。
- 返回主视图过渡。
- 验收：进入/返回流畅，交叉连线标注正确（以纳什均衡为样板数据）。

### M5 · 透视模式 + 证明树
- `PerspectiveToggle`：双线平铺 / 历史聚焦 / 数学聚焦。
- `ProofTree`：纳什存在性四分支（角谷 / 布劳威尔 / 范美·格利克斯伯格 / 塔斯基），展开/收起，标注适用条件与优劣。**多分支平等呈现，不暗示唯一标准证明**（claude.md 强制）。
- 节点数大时切 Canvas 渲染。
- 验收：数学聚焦模式下证明树可逐层展开。

### M6 · 联动与筛选
- `TagFilter`：标签筛选联动四象限（高亮 + 降饱和，保留关系箭头）。
- `ApplicationFilter`：应用领域 → 时间环节点点亮 + 多支柱柔光。
- 数学工具点击 → **应用历程卡片**（首次引入/后续延伸/精炼应用 + 主动跳转按钮）。
- `CompareMode`：框选 2+ 理论 → 并列卡片 + 自动对比连线。
- 验收：联动均为「按需触发」，无强制全局刷新。

### M7 · 模拟器模块（全屏独立）
- 求解逻辑置于**纯函数 / Web Worker**（claude.md 强制，避免阻塞主线程）。
- 囚徒困境：策略切换 + 收益矩阵实时高亮 + 均衡状态提示。
- 逆向归纳：可收缩博弈树 + 逆向逐步点亮收束至根。
- 混合策略：双概率滑杆 + 期望收益曲线 + 均衡概率自动标记。
- 多入口：象限详情卡片底部 + 应用环案例节点。
- 验收：三模拟器可全屏调用并正确求解。

### M8 · 详情面板 + 学习路径
- `DetailPanel`：可拖拽/折叠分层卡片（概念/历史/数学/应用），数学卡含类比版。
- `pathStore`：标记关键节点 → 学习路径图，支持导出/回看（persist）。
- 验收：完整探索闭环，刷新后学习路径保留。

### M9 · 打磨与交付
- 动效统一审校；响应式四档（>1440 / 1024-1440 / 768-1024 / <768，含手机单列降级）。
- 色觉无障碍模拟验证 + 冗余编码补齐。
- Playwright E2E：进入深度视图、切换证明树、跑模拟器等关键路径。
- Vercel 部署 + 预览分支。
- 验收：上线预览，Lighthouse 与无障碍检查通过。

---

## 八、测试策略

- **单元（Vitest）**：布局纯函数、求解器、dataLoader 校验、Zustand 切片。
- **组件（RTL）**：QuadrantView 交互、PerspectiveToggle、ProofTree 展开。
- **E2E（Playwright）**：四象限 → 深度视图 → 证明树 → 模拟器 → 保存路径 全流程。
- **数据 CI**：`data:validate` 断链即失败，纳入提交前检查。

---

## 九、给 AI 协作者的硬约束（来自 claude.md，开发全程遵守）

1. 扩展证明路径时**多分支平等**，不暗示唯一标准证明。
2. 新增理论节点时**同步更新**其与已有支柱的继承/批判关系，保持图谱逻辑一致。
3. 模拟器数学求解必须置于 **Web Worker 或纯函数**，不得阻塞主线程。
4. 所有颜色映射须经**色觉障碍模拟验证**，关键状态变化提供**形状/标签冗余编码**。

---

## 十、风险与待确认事项

| 项 | 风险 | 应对 |
| :--- | :--- | :--- |
| 学术内容填充 | 知识库需专家校核，工作量大 | M1 先填四支柱+关系跑通骨架，内容并行迭代 |
| SVG↔Canvas 切换 | 证明树规模阈值不明确 | M5 设节点数阈值，超阈自动切 Canvas |
| 双重螺旋布局 | 非线性时间轴 + 层次轴对齐复杂 | 布局算法纯函数化并单测，先用样板数据验证 |
| 响应式空间隐喻 | 小屏丢失象限隐喻 | <768 降级为单列卡片流，保留内容结构 |

### 待用户确认
- 知识库内容由谁提供/校核？是否已有学术资料源？
- 是否需要 i18n（当前全中文，是否预留英文）？
- 部署目标确认 Vercel？是否需要自定义域名？

---

## 下一步（建议立即执行）
**M0 工程脚手架** → **M1 数据层（先填四支柱 + 关系）** → **M2 四象限静态主视图**。
三步完成后即可得到「能看见四象限版图 + 叙事主干」的首个可演示版本。
