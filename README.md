# Roomwave

以虚拟人物为核心的多房间互动空间。用户进入主题房间、与人物互动，并保留自己的外观与进度。

## 项目结构

| 目录 | 职责 |
|---|---|
| [roomwave/](roomwave/README.md) | 产品前端、后台、房间玩法与共用状态模型 |
| [spine_runtime/](spine_runtime/README.md) | 人物演出、对话编排适配、动作、声音与旧 Canvas 产品适配 |
| [spine_manager/](spine_manager/README.md) | 资源检查、制作、打包、验证与候选推广 |
| [resources/](resources/README.md) | 图片、声音、人物包、注册表和来源索引 |
| airi/ | 固定版本的 AIRI 上游子项目，由运行时准备脚本获取并应用补丁 |
| rigby2d/ | 独立的 Rigby2D 编辑器子项目，供资源生产调用 |
| [docs/](docs/ARCHITECTURE.md) | 跨模块目标、架构、状态与验证说明 |

模块拥有自己的代码、测试和操作说明；根目录提供统一命令。上游项目保留各自 Git 仓库，不混入本项目的业务目录。

## 本地运行

在本目录执行：

```powershell
npm start
```

访问 [Solo](http://127.0.0.1:4173/solo/) 或 [Together](http://127.0.0.1:4173/together/)。两种模式使用同一份前端页面。

端口被其他项目占用时，可在 PowerShell 设置 `$env:PORT='4174'` 后执行 `npm start`。当前目录迁移的浏览器验收使用 4174。

人物演出页单独启动：

```powershell
npm run runtime:start
```

访问 [c010 演出页](http://127.0.0.1:5180/)。首次准备和验证命令见 [spine_runtime/README.md](spine_runtime/README.md)。

目前人物演出页使用固定脚本和固定测试声音，真实模型与 TTS 尚未接入。它与多房间产品独立运行。

## 阅读入口

- [业务目标](docs/GOAL.md)
- [模块架构与资源路径](docs/ARCHITECTURE.md)
- [当前状态](docs/STATUS.md)
- [验证命令](docs/VALIDATION.md)
- [来源与许可](SOURCE-NOTICE.md)

资源查询从 [resources/index.json](resources/index.json) 开始。用户运行状态保存在产品模块或浏览器中，不属于资源目录。
