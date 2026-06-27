# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

梁sir的木魚 — 一个纯前端"敲木鱼积/减功德"互动网页应用，运行在 WebView 容器（appConfig.xlt 配置）中。当前版本 V5.0.1。

纯静态项目，无构建工具、无包管理器、无 Node 依赖。直接用浏览器打开 `index.html` 即可运行。

## 架构

两个立即执行函数 (IIFE) 组成全部 JS 逻辑，**顺序加载，不可调换**：

1. **`js/main.js`** — 核心游戏逻辑
   - 功德计数 (`currentCount`) 与变化量 (`knockDelta`)
   - 敲击交互（点击木鱼 / 空格键 / 移动端 touch）
   - 自动敲（`setInterval`，最小 20ms）
   - 飘字动画（`showFloatingText`，模板支持 `{n}` 占位符）
   - 手动设置功德数
   - 所有状态通过 `localStorage` 持久化（键：`meritCount`、`knockDelta`、`lensir_floatText`）

2. **`js/enhancements.js`** — 防篡改保护与开发者模式
   - PIN 密码弹窗（硬编码 `CORRECT_PWD = '112233'`）
   - 开发者模式：可修改标题、浮窗模板、功德数
   - 防篡改机制：`MutationObserver` 监听 + 5 秒轮询恢复 `#countDisplay` / `#titleText` / `.subtitle` / `document.title`
   - 全局 `contenteditable=false` + `draggable=false` 锁定
   - 底部 🐟 emoji 点击转发为木鱼敲击事件

**关键约束：** `enhancements.js` 中的设置弹窗通过操作 `main.js` 的 DOM 元素（`#countInput` + `#setCountBtn`）来间接修改功德数，两个脚本之间没有直接 API 通信。

## 样式体系

- **`css/style.css`** — 主样式，CSS 自定义属性（Design Tokens）定义在 `:root`，禅意主题（紫+金配色）
- **`css/font.css`** — Pacifico + Roboto 本地 woff2 字体声明
- **`font/`** — 本地字体文件，避免了 Google Fonts 外部请求（但 `style.css` 第一行仍引用了 Google Fonts 的 Noto Serif SC / Noto Sans SC / Outfit）

## 设计规范

- 色彩体系通过 CSS 变量管理：`--violet` 系（品牌紫）、`--gold` 系（佛教金）、`--rose` 系（樱花粉）
- 新拟态 (Neumorphism) 风格阴影：`--shadow-btn`（凸起）、`--shadow-btn-press`（按下）、`--shadow-inset`（凹陷）
- 响应式断点：500px
- 动画曲线：`--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`
- 支持 `prefers-reduced-motion` 减弱动画

## 运行与测试

```bash
# 无构建步骤，直接在浏览器打开
start index.html          # Windows
# 或用任意静态服务器，例如：
npx serve .               # 需要网络加载 Google Fonts
```

无自动化测试、无 lint 配置。验证方式为手动操作。

## 注意事项

- `knockDelta` 强制 ≤ -1（不允许 0 和正数），这是核心业务规则
- 防篡改机制会覆盖通过 DevTools 修改的 DOM 内容，调试时需注意
- localStorage 键名以 `lensir_` 前缀存储自定义设置（`lensir_pageTitle`、`lensir_htmlTitle`、`lensir_floatText`）
- appConfig.xlt 是 WebView 容器配置，不是 XLS 模板文件
