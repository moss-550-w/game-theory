# 博弈论思想演进全景

一个以**四大理论支柱**为骨架的博弈论思想演进可视化交互应用，帮助学习者从“理论版图”到“证明细节”再到“经典模型验证”，建立对博弈论演化脉络的整体认知。

![license](https://img.shields.io/github/license/your-org/game-theory-viz)
![tech](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![tech](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![tech](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

---

## 项目简介

博弈论并非一堆孤立定理的集合，而是一场不断追问的思想运动：

- 如果现实不是**零和**的？→ 纳什均衡
- 如果博弈有**先后顺序**？→ 逆向归纳均衡
- 如果**信息是不对称**的？→ 贝叶斯均衡

本项目通过**星云式四象限**主视图，将四大理论支柱（极小极大定理、纳什均衡、逆向归纳均衡、贝叶斯均衡）锚定在“零和 ↔ 非零和”与“静态/完全信息 ↔ 动态/不完全信息”的矩阵中，并用永久性关系箭头呈现理论之间的继承、推广与融合。

适用于：

- 学术梳理与教学演示
- 知识体系自建构
- 博弈论历史与数学证明的交叉探索

---

## 核心特性

### 1. 星云式四象限理论版图

- 横轴：零和 → 非零和
- 纵轴：静态/完全信息 → 动态/不完全信息
- 四大支柱各自锚定一个象限，边界渐变模糊表示理论交叉
- 内置继承/推广/融合箭头，构成核心叙事主干

### 2. 以理论为中心的深度探索

点击任一象限进入**双重螺旋视图**：

- **历史演进线**：前驱 → 提出 → 精炼 → 延伸
- **数学支撑线**：底层基础 → 核心定理 → 证明构造 → 精炼
- **交叉连线**：精确标注“历史需求 → 数学工具”的映射关系

### 3. 多分支证明路径树

针对纳什均衡存在性等关键结论，展示多种证明路径（角谷、布劳威尔、范美-格利克斯伯格、塔斯基不动点定理等），标注适用条件与优劣，避免固化唯一“标准证明”。

### 4. 交互式经典模型模拟器

- **囚徒困境**：策略切换 + 实时收益矩阵高亮
- **逆向归纳**：可收缩博弈树 + 逆向逐步点亮
- **混合策略**：双概率滑杆 + 实时期望收益曲线

### 5. 筛选、对比与学习路径

- 理论属性标签筛选（合作/非合作、静态/动态、信息状态等）
- 应用领域筛选（拍卖、军控、演化生物学等）
- 理论对比模式：并列展示核心假设、均衡概念、数学工具
- 学习路径保存：标记关键节点，导出个人探索路径

---

## 技术栈

| 类别 | 技术 |
| :--- | :--- |
| 前端框架 | React 18 + TypeScript 5 |
| 构建工具 | Vite 5 |
| 可视化 | D3.js v7 + @visx |
| 动画 | Framer Motion |
| 状态管理 | Zustand（切片化 + persist） |
| 样式 | Tailwind CSS 3 + Radix UI |
| 数据层 | YAML 结构化知识库，Vite 导入 |
| 测试 | Vitest + React Testing Library + Playwright |
| 部署 | Vercel（支持预览分支与 CI/CD） |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问地址：http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

---

## 项目结构

```
game-theory-viz/
├── src/
│   ├── components/
│   │   ├── QuadrantView/        # 四象限主视图
│   │   ├── TheoryDetail/        # 单理论深度视图（双重螺旋）
│   │   ├── ProofTree/           # 多分支证明树
│   │   ├── Simulators/          # 交互模拟器
│   │   ├── Filters/             # 筛选与对比
│   │   ├── DetailPanel/         # 分层详情卡片
│   │   └── ui/                  # 通用 UI 组件
│   ├── data/                    # YAML 知识库
│   ├── hooks/                   # 自定义 Hooks
│   ├── store/                   # Zustand 状态切片
│   ├── utils/                   # 布局算法与求解器
│   ├── styles/                  # 全局样式
│   └── types/                   # TypeScript 类型定义
├── e2e/                         # Playwright E2E 测试
├── scripts/                     # 数据校验脚本
├── design.md                    # 交互设计方案
├── claude.md                    # 技术架构与约定
├── plan.md                      # 实施计划与里程碑
└── README.md
```

---

## 可用脚本

| 脚本 | 说明 |
| :--- | :--- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | TypeScript 类型检查并构建 |
| `npm run preview` | 本地预览生产构建 |
| `npm run test` | 运行 Vitest 单元/组件测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:e2e` | 运行 Playwright E2E 测试 |
| `npm run data:validate` | 校验知识库 YAML 数据完整性 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run format` | 使用 Prettier 格式化代码 |

---

## 测试

- **单元测试**：Vitest 覆盖布局算法、求解器、dataLoader 校验、Zustand 切片
- **组件测试**：React Testing Library 覆盖四象限交互、透视切换、证明树展开
- **E2E 测试**：Playwright 覆盖“四象限 → 深度视图 → 证明树 → 模拟器 → 保存路径”全流程

运行测试：

```bash
npm run test
npm run test:e2e
```

---

## 部署

项目默认配置为通过 Vercel 部署。`vite.config.ts` 中设置了 `base: '/game-theory/'`，如需部署到自定义路径或根域名，请相应调整。

GitHub Actions 工作流位于 `.github/workflows/deploy.yml`，支持预览分支自动部署。

---

## 设计文档

- [design.md](./design.md)：交互设计方案与视觉规范
- [claude.md](./claude.md)：项目概述、技术架构与 AI 协作者约定
- [plan.md](./plan.md)：实施计划与里程碑

---

## 许可证

[MIT](./LICENSE)
