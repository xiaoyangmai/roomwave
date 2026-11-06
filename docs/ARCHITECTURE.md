# 模块架构

目录基线：2026-11-04。

## 责任与依赖

```text
roomwave/                 产品前端、后台和共用房间模型
  frontend/               房间界面、导航、衣柜、声音和资源描述
  backend/                本地 HTTP API、静态挂载和用户数据
  shared/                 浏览器与后台共用的模拟逻辑

spine_runtime/            人物运行时
  src/stage/              AIRI 单页演出适配
  src/canvas/             仍被产品使用的 Canvas 适配
  scripts/                素材准备与启动
  tests/                  人物与对话回归
  patches/                对固定 AIRI 上游的可重建补丁

spine_manager/            离线资源生产与验证
resources/                产品可消费的共用资源与索引
airi/                     AIRI 上游独立子项目
rigby2d/                  Rigby2D 上游独立子项目
docs/                     跨模块说明
```

各模块内部具体目录以其 README 为准。

产品拥有用户状态与房间状态。人物运行时接收演出意图并负责动作和声音，不保存金币、衣柜和房间进度。资源生产只操作素材与候选交付物，不持有在线用户状态。

## 当前运行路径

1. Roomwave 后台在 4173 提供产品页面、API 和静态资源。Solo/Together 共用页面，模式由路径决定。
2. 现有 c010 产品房间使用 spine_runtime 中的 Canvas 适配器。
3. AIRI 单页演出在 5180 独立运行。准备脚本从人物包读取素材并生成 ZIP；运行阶段由 AIRI WebGL 组件加载。
4. AIRI 演出页尚未与房间业务连接。共享推流实验已移除。

## 资源索引与静态路径

[resources/index.json](../resources/index.json) 是资源目录入口；[角色注册表](../resources/config/character-registry.json) 将角色 ID 指向具体 Character Pack。

| HTTP 路径 | 文件来源 |
|---|---|
| /assets/ | resources/assets/ |
| /audio/ | resources/audio/ |
| /character-packs/ | resources/characters/ |
| /config/ | resources/config/ |
| /resources/index.json | resources/index.json |
| /runtime/ | spine_runtime/src/canvas/ |
| /shared/ | roomwave/shared/ |

这些路径是产品的资源端点，不依赖旧 src 目录。人物包中的相对文件引用由加载器解析，生产工具与准备脚本使用对应磁盘目录。

## 状态归属

- 个人房间进度、心情和声音偏好：浏览器 localStorage。
- Solo 衣柜：roomwave/backend/data/ 中按匿名客户端保存。
- Together 房间模拟与共享衣柜：后台内存；当前没有跨重启持久化。
- 演出页对话：当前页面会话内存。
- 素材、人物包和资源元数据：resources。

## 上游项目

AIRI 保持固定提交，补丁保存在 spine_runtime/patches。运行时准备脚本能够重建所需上游源码。

Rigby2D 保持独立 Git 项目，Spine Manager 调用其 MCP。更新上游版本时分别运行人物或生产回归，不将上游源码复制进业务模块。
