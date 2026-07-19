---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3046022100b0c71fc6db43b63af2f3f9d7091d25050bc32c5d258174796c8b3a1439c57c05022100cce74f95f5a9dd84b96a871dbcd8a99ba0a4008cdc30c53cd509f6dc466e9d50
    ReservedCode2: 30440220671c23386b3f09b165d1c507aaef0ee08ce84cfbd9d967129ad465eba323bb9602201beb7966362987957ccdbf2c92825d463b1aea6a332fcc964f7366e4012e0ad4
---

# React 待办事项管理系统

一个基于 React 18 + TypeScript + Tailwind CSS 的现代化待办事项管理 Web 应用，采用马卡龙配色方案，提供直观美观的用户体验。

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal?logo=tailwindcss)

## 在线演示

部署完成后访问：**https://你的用户名.github.io/仓库名**

## 核心功能

- **待办事项管理**：创建、编辑、删除、标记完成
- **优先级设置**：支持高、中、低三级优先级
- **分类管理**：自定义分类标签
- **多种视图**：列表视图、看板视图、日历视图
- **数据统计**：完成率统计、趋势图表
- **导入导出**：支持 CSV 格式数据导入导出
- **主题切换**：明暗主题一键切换
- **数据持久化**：本地存储，数据永不过期

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | 前端框架 |
| TypeScript | 类型安全 |
| Vite 6 | 构建工具 |
| Tailwind CSS | 样式框架 |
| Radix UI | 无样式组件库 |
| Lucide React | 图标库 |
| React Context | 状态管理 |
| LocalStorage | 数据持久化 |
| Recharts | 数据可视化 |
| date-fns | 日期处理 |

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 9.0 或更高版本

### 安装依赖

```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或者使用 npm
npm install

# 或者使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
# 构建项目（输出到 docs/ 目录）
pnpm build

# 构建生产优化版本
pnpm build:prod
```

## GitHub Pages 部署

本项目已配置自动部署到 GitHub Pages。

### 自动部署（推荐）

1. **创建 GitHub 仓库**
   - 在 GitHub 创建新仓库
   - 上传本项目所有文件

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages"（自动创建）或 "main" + "/(root)"
   - 点击 Save

3. **配置 GitHub Actions**
   - 首次推送代码后，GitHub Actions 会自动运行
   - 前往 Actions 标签查看部署进度
   - 部署完成后即可访问

### 手动部署

```bash
# 构建项目
pnpm build

# 推送 dist 目录内容到 gh-pages 分支
npx gh-pages -d docs
```

### 部署注意事项

- 确保 `vite.config.ts` 中 `base` 配置为 `'./'`
- 确保构建输出目录为 `docs/`（已配置）
- GitHub Actions 会在每次推送到 main 分支时自动部署

## 项目结构

```
todo-app-backup/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── public/                      # 静态资源
├── src/
│   ├── components/
│   │   ├── dashboard/          # 仪表盘组件
│   │   ├── todo/               # 待办组件
│   │   └── ui/                 # 基础 UI 组件
│   ├── context/                # React Context
│   │   ├── TodoContext.tsx     # 待办状态管理
│   │   └── ThemeContext.tsx    # 主题状态管理
│   ├── hooks/                   # 自定义 Hooks
│   ├── lib/                    # 工具函数
│   │   ├── utils.ts            # 通用工具
│   │   └── theme.ts            # 主题配置
│   ├── pages/                  # 页面组件
│   │   ├── Dashboard.tsx       # 仪表盘页
│   │   ├── TodoList.tsx       # 待办列表页
│   │   ├── AddTodo.tsx        # 添加待办
│   │   ├── EditTodo.tsx       # 编辑待办
│   │   ├── Statistics.tsx     # 统计页
│   │   └── Settings.tsx       # 设置页
│   ├── types/                  # TypeScript 类型
│   │   └── todo.ts            # 待办相关类型
│   ├── App.tsx                # 应用入口
│   └── main.tsx               # 渲染入口
├── docs/                       # 构建输出（GitHub Pages）
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 使用指南

### 添加待办事项

1. 点击右下角「+」按钮
2. 输入标题和描述
3. 选择优先级和分类
4. 设置截止日期和提醒时间
5. 点击确认保存

### 管理待办事项

- **完成**：点击复选框标记完成
- **编辑**：点击编辑图标修改内容
- **删除**：点击删除图标移除
- **筛选**：使用顶部筛选器查看不同状态

### 查看统计

- 进入「统计」页面查看完成率图表
- 支持近 7 天和近 30 天数据切换

### 数据备份

- 进入「设置」页面
- 点击「导出数据」下载 CSV 文件
- 可通过「导入数据」恢复备份

## 自定义配置

### 修改主题颜色

编辑 `tailwind.config.js` 中的颜色配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fdf2f8',
        // ... 其他色阶
      }
    }
  }
}
```

### 添加新分类

编辑 `src/types/todo.ts` 中的 `DEFAULT_CATEGORIES`：

```typescript
export const DEFAULT_CATEGORIES = [
  { id: 'work', name: '工作', color: '#3b82f6' },
  { id: 'life', name: '生活', color: '#10b981' },
  // 添加新分类
];
```

## 浏览器支持

- Chrome 最新版
- Firefox 最新版
- Safari 最新版
- Edge 最新版

## 开发团队

- **开发者**：MiniMax Agent
- **版本**：1.0.0
- **许可证**：MIT

## 致谢

- [Vite](https://vitejs.dev/) - 极快的构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式可访问组件
- [Lucide](https://lucide.dev/) - 精美图标库

---

**祝你使用愉快！** 🎉
