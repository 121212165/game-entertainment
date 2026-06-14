# game-entertainment

游戏娱乐项目合集

---

## 项目

| 项目 | 说明 | 技术栈 | LOC |
|------|------|--------|-----|
| **BioEvolution** | 人工生命演化模拟器 — 光能体 vs 暗影体 | Vanilla JS + Canvas | ~950 |
| **SiLeMa** | 每日签到保平安 — 连续2天未签到自动通知 | Single HTML + localStorage | ~200 |

## 快速开始

### BioEvolution

```bash
# 直接打开
start bioevolution/index.html
```

### SiLeMa

```bash
# 直接打开
start silema.html
```

零依赖，零构建，浏览器直接运行。

---

## 项目结构

```
├── bioevolution/          # 生物演化模拟器
│   ├── index.html         # 入口页面
│   └── js/
│       ├── types.js       # 类型常量
│       ├── core.js        # 环境 + 生物逻辑
│       ├── renderer.js    # Canvas 渲染 + 图表
│       └── main.js        # 应用入口
├── silema.html            # 死了么 — 签到应用（单文件）
├── RECONSTRUCTION-PLAN.md # 重构计划
└── FIRST-PRINCIPLES-RECONSTRUCTION.md # 第一性原理分析
```

---

*最后更新: 2026-06-14*
