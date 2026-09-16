# FleetOS - 企业级 AI 智能车队管理与实时调度平台

<div align="center">

![FleetOS Banner](https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80)

**基于 React 19 + TypeScript + Node.js + Tailwind CSS v4 构建的新一代企业级智能车队数字化操作系统**

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Google GenAI](https://img.shields.io/badge/Google%20GenAI-Gemini-orange.svg)](https://ai.google.dev/)

</div>

---

## 📖 项目简介 (Overview)

**FleetOS** 是一套面向重卡物流、冷链干线、危化品运输与城市绿色配送等复杂物流场景的企业级车联网调度与监控系统。系统深度整合物联网（IoT）数据网关、高精度 GIS 路径规划与贴路算法、多路车载流媒体与计算机视觉（DSM/ADAS）、AI 预测性维保以及大语言模型智能管家，赋能现代物流企业实现全流程降本增效与数字化闭环。

---

## ✨ 核心特性 (Key Features)

### 1. 📊 综合数字驾驶舱 (Cockpit Overview)
- **运营大盘与运力全景**：实时掌控在途车辆、空闲运力、异常告警与当日任务完成率。
- **动态能耗与维保预警**：百公里油耗/电耗趋势分析、关键零部件寿命预警雷达。
- **主动安全看板**：多维度安全分级评分（优秀、良好、预警、高危），实时统计疲劳驾驶与急转偏航事件。

### 2. 🗺️ 实时遥测监控与高精路网贴合 (Real-time GIS & Road Snapping)
- **OSM 道路中心线强制锁死 (Anti-drift Map-matching)**：自研正交投影匹配算法，根据车辆推算经纬度实时吸附至最近的真实路网中心线，杜绝漂移与横穿楼宇。
- **Catmull-Rom 样条曲线平滑插值**：采用连续三次样条曲线拟合高速互通与复杂立交弯道，配合微元切线计算连续车头朝向角（Heading）。
- **多图层渲染与自适应缓存**：支持高德/天地图/OSM 瓦片切换、车辆多维度聚合以及轨迹跟踪跟随视角。

### 3. 📹 多路车载视频与 AI 智能监控中心 (Camera Surveillance & In-Cabin AI)
- **4路高清视频通道实时切换**：
  - **CAM-01 主驾驶舱红外感知 (DSM)**：人脸疲劳、打哈欠、分心看手机检测与网格特征标定。
  - **CAM-02 前方道路安全感知 (ADAS)**：前向碰撞预警（FCW）、车道偏离预警（LDW）、车距实时测算。
  - **CAM-03 车厢温湿度与货物状态**：冷链多温区监控与防开门盗损检测。
  - **CAM-04 尾部倒车雷达与盲区影像**：盲区行人和障碍物自动监测。
- **本地摄像头即插即用接入 (Webcam Live Stream)**：支持一键调用本机真实摄像头作为车载流媒体测试输入。
- **PTZ 云台微调与双向语音对讲**：支持镜头上下俯仰、左右旋转、光学变焦（Zoom+/Zoom-）以及 PTT 双向对讲与云端录像。

### 4. 🛰️ 车联数据网关 (IoT Telemetry Gateway)
- **多协议标准化接入**：兼容 JT/T 808、GB/T 32960 等国家车联网标准协议格式。
- **高频数据模拟与流注入**：支持每秒数十次遥测帧推送，包含车速、转速、胎压、电量、发动机温度等传感器指标。
- **故障注入与场景重演**：可模拟突发超速、急刹车、低温失压以及离线脱网等应急演练场景。

### 5. 🚚 智能调度派单与运力优化 (Intelligent Dispatch)
- **自动化派单引擎**：综合考量司机工时合规、车型载重、容积与温控要求，实现智能人车货最优匹配。
- **多节点路线规划**：根据实时路况规避限行路线与施工路段，降低空驶率与过路费支出。

### 6. ⏱️ 历史轨迹研判回放 (Track Playback)
- **秒级轨迹时间轴**：支持 1x~16x 倍速回放、拖拽进度条定位与停留点分析。
- **全要素动态图表**：同步展示速度剖面、油耗曲线与沿途异常超速/疲劳打卡标记。

### 7. 🛡️ 电子围栏管控 (Geofencing)
- **灵活区域定义**：支持绘制多边形、圆形、干线走廊以及省市行政边界围栏。
- **进出即时预警**：触发越界、违规偏航、禁行区驶入时毫秒级弹窗提示并联动声光告警。

### 8. 🤖 AI 车队智能管家 (Fleet AI Assistant)
- **Google Gemini 大模型驱动**：基于服务端 `@google/genai` 接入深度微调的运力领域 AI 专家。
- **自然语言调度决策**：支持诸如“查询华东区当前空闲冷藏车”、“分析粤B66666近期异常油耗原因”等语义问答并生成分析报表。

---

## 🛠️ 技术栈 (Tech Stack)

| 层级 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | React 19 + TypeScript | 最新 React 19，全面采用函数式组件与 Hooks |
| **构建工具** | Vite 6 + esbuild | 极速秒级 HMR 与高效生产构建 |
| **样式方案** | Tailwind CSS v4 | 全新纯 CSS 配置的 Tailwind v4 现代原子化样式 |
| **地图引擎** | Leaflet + 自研瓦片缓存引擎 | 轻量高性能瓦片地图与自定义矢量图层 |
| **动效库** | Motion (motion/react) | 丝滑的交互展开与图层过渡动画 |
| **图标库** | Lucide React | 精美统一的现代线性系统图标 |
| **后端架构** | Node.js + Express + tsx | 生产级前后端同构，托管静态资源与 API 服务代理 |
| **AI 引擎** | Google GenAI SDK (`@google/genai`) | 安全服务端调用 Gemini 大模型，秘钥隔离防护 |

---

## 📂 目录结构 (Directory Structure)

```bash
├── src/
│   ├── components/
│   │   ├── accidents/        # 事故与出险管理模块
│   │   ├── ai/               # AI 智能管家对话与分析中心
│   │   ├── alarms/           # 实时报警列表与处置流转
│   │   ├── cockpit/          # 综合数字驾驶舱主页
│   │   ├── common/           # 全局侧边栏、顶部栏、通知浮窗
│   │   ├── costs/            # 运营成本与财务核算
│   │   ├── dispatch/         # 智能任务派单与调度中心
│   │   ├── documents/        # 车辆证件与保单合规管理
│   │   ├── drivers/          # 驾驶员画像与安全驾驶评分
│   │   ├── events/           # 运营事件审计追踪
│   │   ├── fuel/             # 油耗与充电能效监控
│   │   ├── gateway/          # 车联网数据网关与车载视频监控
│   │   ├── geofence/         # 电子围栏绘制与出入界策略
│   │   ├── maintenance/      # 预测性维保与工单管理
│   │   ├── mobile/           # 移动端司机小程序仿真器
│   │   ├── monitoring/       # 实时 GIS 车辆位置与态势监控
│   │   ├── safety/           # 主动安全防御 (ADAS/DSM) 统计
│   │   ├── settings/         # 系统参数与规则配置
│   │   ├── stats/            # 多维数据报表与导出
│   │   ├── tracks/           # 轨迹回放与运行分析
│   │   └── vehicles/         # 车辆档案与台账详情
│   ├── data/                 # 初始种子数据与基础字典
│   ├── services/             # 业务服务层
│   │   ├── gpsSimulator.ts       # 60FPS 丝滑高精定位驱动器
│   │   ├── roadNetworkEngine.ts  # OSM 道路网格化与 Catmull-Rom 插值引擎
│   │   ├── telemetryGateway.ts   # 车载遥测网关调度
│   │   ├── gateway.ts            # 全局网关统一出口
│   │   └── leafletCachedLayer.ts # 地图瓦片离线缓存管理
│   ├── types.ts              # 全局 TypeScript 数据模型定义
│   ├── App.tsx               # 应用主入口与标签路由切换
│   └── main.tsx              # React DOM 渲染入口
├── server.ts                 # Express 服务端入口（API 代理与静态资源托管）
├── vite.config.ts            # Vite 构建配置
├── package.json              # 项目依赖清单
├── tsconfig.json             # TypeScript 编译器配置
└── metadata.json             # AI Studio 应用元数据
```

---

## 🚀 快速上手 (Getting Started)

### 1. 环境准备
- Node.js 18.0 或更高版本
- npm、yarn 或 pnpm

### 2. 克隆仓库与安装依赖
```bash
# 克隆项目仓库
git clone <your-github-repo-url>.git
cd fleet-management-platform

# 安装项目依赖
npm install
```

### 3. 配置环境变量
在项目根目录创建 `.env` 文件（参考 `.env.example`）：
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. 启动本地开发服务
```bash
npm run dev
```
开发服务器启动后，在浏览器访问 [http://localhost:3000](http://localhost:3000) 即可体验。

### 5. 生产构建与启动
```bash
# 编译前端静态资源与服务端打包
npm run build

# 启动生产服务
npm run start
```

---

## 💡 核心算法剖析 (Key Algorithms)

### 1. OSM 道路中心线正交投影匹配 (Orthogonal Map Snapping)
车辆更新坐标时，系统会将原始经纬度与稠密化的道路分段矢量计算局部余弦距离场投影：

$$u = \frac{(\vec{P} - \vec{A}) \cdot (\vec{B} - \vec{A})}{\|\vec{B} - \vec{A}\|^2}, \quad u \in [0, 1]$$

投影点 $\vec{C} = \vec{A} + u(\vec{B} - \vec{A})$ 作为锁死位置，确保车标100%吸附在道路中心线上，消灭横穿草坪和建筑物的“飞行”现象。

### 2. Catmull-Rom 样条过弯曲线插值 (Spline Interpolation)
对两个控制点之间的路段进行高阶平滑曲线过渡计算，赋予车辆平顺自然的转弯加速度和微元切线航向角：

$$\vec{P}(t) = 0.5 \cdot \left( 2\vec{P}_1 + (-\vec{P}_0 + \vec{P}_2)t + (2\vec{P}_0 - 5\vec{P}_1 + 4\vec{P}_2 - \vec{P}_3)t^2 + (-\vec{P}_0 + 3\vec{P}_1 - 3\vec{P}_2 + \vec{P}_3)t^3 \right)$$

---

## 📄 开源许可 (License)

本项目基于 [MIT License](LICENSE) 协议发布。
