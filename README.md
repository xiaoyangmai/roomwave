# Roomwave 本地整理版

这是从公开页面整理出的 Roomwave 前端文件，并配了一个本地 Node.js 服务，入口对应：

- `together/`：一起观看页面
- `solo/`：单人页面入口（使用同一套公开前端资源）

## 运行

在这个目录执行：

```powershell
node server.cjs
```

然后打开：

- http://127.0.0.1:4173/together/
- http://127.0.0.1:4173/solo/

也可以执行：

```powershell
.\start-roomwave.ps1
```

产品代码和运行资源位于 `src/`，资源生产工作台位于外层 `spine_manager/`。根目录只保留服务器、启动脚本和项目说明。服务器会把 `src/` 作为静态资源根目录，所以产品 URL 仍然使用 `/solo/`、`/together/`、`/assets/` 和 `/spine-audit/`。

Spine Portable、原始 `.spine` 工程、NIKKE 源压缩包和本地 MCP 配置不属于这个产品目录。需要运行 Spine 工作台时，通过 `SPINE_BIN`、`SPINE_BRIDGE`、`SPINE_PROFILE_ROOT`、`C010_SPINE_ARCHIVE` 和 `ROOMWAVE_C010_PROJECT` 指向外部 Spine Lab。

要直接打开 c010 Spine 试作，可执行 `start-roomwave-spine.cmd`；桌面上的 `Roomwave Spine - 启动.cmd` 也是同一个入口。

本地服务提供 `/api/rooms`、`/api/wardrobe` 和 `/api/visits`，用于房间同步、衣柜状态和访问人数。衣柜状态会保存在 `src/data/wardrobe-state.json`。

## 文件来源

资源来自公开页面：

`https://roomwave-live.sagan1122.chatgpt.site/together/`

`mirror-report.json` 记录了本次下载的文件清单和原始地址。`tools/sync_public_assets.py` 可以在需要时重新抓取公开资源；`tools/fetch_gaming_assets.py` 用于补齐 Gaming 房间按运行状态动态选择的素材。

## 当前范围

这里保存的是浏览器端公开加载的 HTML、CSS、JavaScript 和媒体资源。页面没有提供完整工程仓库或单独的开源许可证，因此原始来源和使用权限仍以目标站点及其资源声明为准。
