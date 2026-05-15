# DailyTaskBar

一款轻量级的桌面悬浮任务栏，用于管理每日固定任务和习惯。基于 Electron + React + TypeScript 构建。

[English](./README.md) | 中文

## 功能特性

- **悬浮任务栏** — 无边框、半透明、永远置顶的桌面窗口
- **任务管理** — 创建、编辑、删除、归档任务，支持拖拽排序
- **任务类型** — 每日、每周、每月、一次性任务，自动重置
- **优先级** — 高、中、低，带颜色标识
- **提醒通知** — Windows 通知，支持免打扰时段
- **系统托盘** — 最小化到托盘，托盘菜单快速操作
- **统计面板** — 连续打卡天数、7天/30天完成率、每日图表
- **快捷键** — Ctrl+N（添加）、Ctrl+F（搜索）、Ctrl+,（设置）、Ctrl+H（显示/隐藏已完成）
- **导入导出** — JSON 格式备份和恢复数据
- **开机自启** — 支持 Windows 开机启动
- **主题** — 亮色、暗色、跟随系统，可自定义强调色和字体大小
- **紧凑模式** — 紧凑和展开两种视图切换
- **数据安全** — 自动备份、数据版本迁移、损坏恢复

## 默认任务（首次启动）

- 背单词
- 刷一道递归题
- PTE Repeat Sentence
- PTE Write Dictation
- 投递/查看岗位
- 论文写作 30 分钟

## 开发环境

### 前置要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

启动 Vite 开发服务器，自动打开 Electron 窗口，支持热更新。

### 运行测试

```bash
npm test
```

### 类型检查

```bash
npm run lint
```

### 打包 Windows 安装程序

```bash
npm run electron:build
```

输出目录：`release/`

> **注意**：打包需要开启 Windows 开发者模式（设置 → 系统 → 开发者选项 → 开发人员模式），否则会因符号链接权限问题失败。

## 项目结构

```
src/
  main/              Electron 主进程
  preload/           预加载脚本（contextBridge）
  shared/            共享类型定义
  renderer/
    components/      React UI 组件
    hooks/           自定义 React Hooks
    services/        业务逻辑服务
    utils/           工具函数
    types/           TypeScript 类型声明
tests/               单元测试
```

## 数据存储位置

所有数据以 JSON 格式存储在：

```
%APPDATA%/daily-task-bar/dailytaskbar.json
```

备份文件：`dailytaskbar.backup.json`（同目录）

## 运行方式

### 方式一：开发模式

```bash
npm install
npm run dev
```

### 方式二：使用打包后的程序

1. 从 [Releases](https://github.com/FangZiyang/DailyTaskNote/releases) 下载最新版本
2. 解压后运行 `DailyTaskBar.exe`

## 快捷键一览

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 添加任务 |
| Ctrl+F | 搜索任务 |
| Ctrl+, | 打开设置 |
| Ctrl+H | 显示/隐藏已完成任务 |
| Esc | 关闭当前面板 |
| Enter | 确认编辑 |
| Delete | 删除选中任务（需确认） |

## 架构说明

- **主进程** (`src/main/main.ts`) — 窗口管理、托盘、IPC、文件读写、开机自启
- **预加载** (`src/preload/preload.ts`) — 通过 `contextBridge` 暴露安全 API
- **渲染进程** (`src/renderer/`) — React UI，使用 Hooks 管理状态
- **存储** — 主进程读写 JSON 文件，渲染进程缓存
- **重置逻辑** — 应用启动和日期变化时自动执行，重置前记录完成历史

## 常见问题

**应用无法启动**
- 删除 `%APPDATA%/daily-task-bar/dailytaskbar.json` 重置数据
- 检查是否有另一个实例正在运行

**数据损坏**
- 应用会自动尝试读取 `dailytaskbar.backup.json` 备份
- 也可以手动删除两个文件重新开始

**通知不工作**
- 检查 Windows 通知设置
- 确认设置中通知已开启
- 检查是否处于免打扰时段

**窗口跑到屏幕外**
- 删除 `%APPDATA%/daily-task-bar/dailytaskbar.json` 重置窗口位置
- 或在设置中关闭"记住窗口位置"

## 技术栈

- Electron 33
- React 18
- TypeScript 5
- Vite 6
- Tailwind CSS 3
- Vitest
- electron-builder
