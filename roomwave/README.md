# Roomwave 产品

这里负责用户进入房间、互动、成长、Solo/Together、声音和状态保存。角色编辑、内容生产、人物运行时和媒体资源各有独立目录。

在仓库根目录执行 `npm run start`，或在本目录执行 `npm start`。本地服务默认监听 `http://127.0.0.1:4173`。

- `/solo/`：个人房间。
- `/together/`：共享房间；Gaming、Hangout、Baking、Fitness、Fortunes 和 Karaoke 使用同一服务端模拟。
- `/solo/?room=gaming_c010`：c010 角色试作。
- `/together/?room=gaming_c010`：本地 c010 展示，不参与 Together 状态同步。

根路径 `/` 重定向 `/solo/`。两种模式共用 `frontend/index.html`，模式由路径决定。

## 目录

```text
roomwave/
├─ backend/
│  ├─ server.cjs          静态服务、房间命令和衣柜 API
│  └─ data/               个人衣柜运行数据，不提交
├─ frontend/
│  ├─ index.html          唯一页面装配入口
│  └─ src/
│     ├─ rooms/           gaming、hangout、baking、workout、fortune、karaoke、c010
│     ├─ shared/          浏览器的模式选择和 Together 同步
│     ├─ ui/              房间导航、公共样式和界面
│     ├─ audio/           声音偏好、音乐播放和预录语音
│     ├─ wardrobe/        商店、衣柜和角色解锁界面
│     └─ catalog/         人物图集坐标和外观定义
├─ shared/               浏览器与后端共用的状态模型、引擎和编码
└─ tools/check.mjs       JavaScript 语法和页面依赖检查
```

各房间的 `*-room.js` 负责输入和表现；`shared/*-state.js` 负责业务规则与可恢复状态。Hangout 的旧 `app.js` 已命名为 `rooms/hangout/hangout-room.js`。

## 数据与资源边界

- Solo 房间进度、心情和声音设置存浏览器 `localStorage`。
- Solo 衣柜按匿名 cookie 保存到 `backend/data/wardrobe-state.json`。
- Together 房间和共享衣柜存当前 Node 进程内存，重启会重置。
- Together 通过 HTTP 轮询共享命令和 checkpoint，不发送每帧画面。

服务只公开所需目录：`/assets/`、`/audio/`、`/character-packs/`、`/config/` 映射仓库的 `resources/`；`/runtime/` 映射 `spine_runtime/src/canvas/`；`/shared/` 映射本模块的 `shared/`。资源清单为 `/resources/index.json`。AIRI 单页演出由 `spine_runtime` 单独启动。

运行 `npm run check` 检查代码语法和页面脚本、样式、预加载资源。浏览器验收还需覆盖房间切换、一次互动、声音暂停恢复和两个客户端同步。
