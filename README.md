# 智绘线云 — 基于机载 LiDAR 点云的电力线提取与三维重建系统

> 面向电力巡检场景的三维可视化与风险检测平台，第十七届中国大学生服务外包创新创业大赛 **国家级二等奖** 项目，本人担任 **前端负责人**。

## 🛠 技术栈

![Vue3](https://img.shields.io/badge/Vue3-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=flat-square&logo=webgl&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-AA344D?style=flat-square&logo=apacheecharts&logoColor=white)

- **前端框架**：Vue3 + JavaScript
- **三维渲染**：Three.js + WebGL
- **数据可视化**：ECharts
- **接口联调**：RESTful API（10+ 后端接口）

## ✨ 核心功能

- **三维多视角浏览**：支持点云模型自由旋转、缩放、平移，多视角切换
- **危险物自动检测**：基于点云数据自动识别电力线危险物，支持三级风险分级标注
- **空间分析工具**：手动/自动空间测距、弧垂分析、断面分析
- **多维数据可视化**：气象数据、覆冰预测等 ECharts 图表联动展示
- **报告导出**：一键生成巡检分析报告

## ⚡ 性能亮点

针对 **百万级点云** 渲染卡顿问题，设计分块异步加载方案（4000 点/块），结合 WebGL GPU 加速渲染，将交互操作延迟优化至 **1s 以内**，支持单场景 40000+ 点云流畅渲染。

## 🎬 功能动态演示

<video width="860" controls>
  <source src="./assets/天气模拟弧垂分析2_20260826_21561442_20260826_22160203.mp4" type="video/mp4">
</video>
> 气象条件下电力线弧垂仿真分析，三维场景联动数据面板实时展示

<video width="860" controls>
  <source src="./assets/手动测距_20260826_22162633_20260826_22174394.mp4" type="video/mp4">
</video>
> 三维场景手动测距工具，导线与障碍物距离精准量测

## 📸 项目页面展示

| 上帝视角总览 | 巡航视角漫游 |
|:---:|:---:|
| ![上帝视角总览](./assets/上帝视角.png) | ![巡航视角漫游](./assets/巡航视角.png) |
| 三维电力场景全局俯瞰 | 第一视角线路巡检漫游 |

| 数据统计面板 | 风险评估模块 |
|:---:|:---:|
| ![数据统计面板](./assets/数据统计.png) | ![风险评估模块](./assets/风险评估.png) |
| 多维度电力运行指标可视化 | 线路隐患识别与风险等级研判 |

## 🎥 完整项目宣传片

<video width="860" controls>
  <source src="./assets/宣传片_20260826_22045820_20260826_22150514.mp4" type="video/mp4">
</video>
> 项目全功能完整展示宣传片

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打包构建
npm run build
