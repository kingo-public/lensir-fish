# 🐟 梁sir的木魚

> 敲木鱼，积功德，修心养性。

一个纯前端的"敲木鱼积/减功德"互动网页应用，运行在 WebView 容器中，也可直接在浏览器打开。

当前版本：**V5.0.1**

## ✨ 功能

- **敲击木鱼** — 点击木鱼、按空格键、移动端触摸均可敲击
- **飘字动画** — 每次敲击显示功德变化浮动文字，支持自定义模板（`{n}` 占位符）
- **自动敲** — 可设置自动敲击，间隔最小 20ms
- **自定义每次功德** — 可调整每次敲击的功德变化量（强制 ≤ -1）
- **手动设置功德数** — 直接输入数值修改当前功德
- **防篡改保护** — MutationObserver 实时监控 + 5 秒轮询恢复，防止通过 DevTools 篡改内容
- **开发者模式** — PIN 密码保护，可修改标题、浮窗模板、功德数
- **数据持久化** — 所有状态通过 `localStorage` 自动保存

## 🎨 界面风格

- 禅意主题设计：紫（品牌紫 `#7C3AED`）+ 金（佛教金 `#D97706`）+ 粉（樱花粉 `#E11D48`）
- 新拟态（Neumorphism）风格阴影
- 渐变标题文字动画（紫→金流光效果）
- 木鱼 SVG 手绘风格，带光晕呼吸动画
- 毛玻璃卡片 + 清晨渐变背景
- 响应式布局，适配移动端（断点 500px）
- 支持 `prefers-reduced-motion` 减弱动画

## 🚀 使用方式

无需构建工具，直接在浏览器打开即可：

```bash
# Windows
start index.html

# 或用任意静态服务器
npx serve .
```

> ⚠️ 需要网络加载 Google Fonts（Noto Serif SC / Noto Sans SC / Outfit），离线环境字体将回退到系统默认。

## 📁 项目结构

```
├── index.html            # 主页面
├── css/
│   ├── style.css         # 主样式（CSS 自定义属性 + 禅意主题）
│   └── font.css          # Pacifico + Roboto 本地字体声明
├── js/
│   ├── main.js           # 核心游戏逻辑（功德计数、敲击交互、自动敲、飘字动画）
│   └── enhancements.js   # 防篡改保护 + 开发者模式
├── font/                 # 本地 woff2 字体文件
├── happy.mp3             # 音频资源
└── favicon.ico           # 网站图标
```

## 🔧 核心逻辑

| 模块 | 文件 | 说明 |
|------|------|------|
| 功德计数 | `js/main.js` | `currentCount` 变量，敲击时累加 `knockDelta` |
| 敲击交互 | `js/main.js` | 支持 mouseup / keyup / touchend 三种方式 |
| 自动敲 | `js/main.js` | `setInterval` 实现，最小间隔 20ms |
| 飘字动画 | `js/main.js` | `showFloatingText()`，模板 `{n}` 渲染变化量 |
| 防篡改 | `js/enhancements.js` | MutationObserver + 5s 轮询双重保护 |
| 开发者模式 | `js/enhancements.js` | PIN 密码弹窗，支持修改标题/模板/功德数 |

## 💾 本地存储

| 键名 | 说明 |
|------|------|
| `meritCount` | 功德总数 |
| `knockDelta` | 每次敲击变化量 |
| `lensir_pageTitle` | 自定义页面大标题 |
| `lensir_htmlTitle` | 自定义浏览器标签页标题 |
| `lensir_floatText` | 自定义飘字模板 |

## ⚠️ 注意事项

- `knockDelta` 强制 ≤ -1，不允许 0 和正数，这是核心业务规则
- 防篡改机制会自动覆盖通过 DevTools 修改的 DOM 内容，调试时需注意
- `main.js` 和 `enhancements.js` 为 IIFE 顺序加载，不可调换
- `enhancements.js` 通过操作 `main.js` 的 DOM 元素间接修改功德数，两个脚本之间没有直接 API 通信

## 📄 许可证

本项目仅供学习交流使用。
