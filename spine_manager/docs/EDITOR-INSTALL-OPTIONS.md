# c010 编辑器/CLI 获取方案

结论：当前基线是 Spine 4.3.26，需要完整 Spine 许可证页提供的安装器或 Launcher。4.0.47 只保留为回滚源；公开试用版不适合本项目的骨架修改，因为它不能保存工程或导出资源。

官方 Launcher 支持选择具体编辑器版本；本项目固定使用 4.3.26。官方 CLI 与编辑器一起提供，支持打开 `.spine`、导出 JSON/二进制和打包纹理。

当前机器的实际情况：

- 已验证公开试用入口下载的是 4.3.26。
- 4.3.26 试用版已卸载，没有进入 Roomwave 工具链。
- 当前项目已将 4.3.26 便携候选复制到 `tools/spine-4.3.26/`，并用项目副本完成保存、导出和运行时回读验证；4.0.47 源工程只保留作回滚。

推荐路径是从个人许可证页下载安装器。用户不需要把激活码发到聊天中；安装器放到本机后，自动化可以继续完成安装检查、版本选择、派生工程打开和 CLI 导出验证。

项目只接受经过确认的项目内副本：`tools/spine-4.3.26/SpinePortable.exe`。不直接调用下载目录，也不调用 `app\\Spine.exe`。不推荐用第三方二进制改写器、破解包或把 4.3 runtime 强行加载 4.0 导出物。这些方式无法证明会保留网格、约束、皮肤和动画语义。

硬规则：自动化流水线禁止直接调用未激活的 `app\\Spine.com`。所有导出、信息读取和回读都必须通过 `tools/run-spine-portable-cli.ps1`，并先通过 `-CheckActivated`。该规则由 `tools/spine-tool.json` 的 `cliPolicy.forbidDirectCliInvocation` 固化。

项目内检查和启动命令：

```powershell
npm run editor:check-c010
powershell -NoProfile -ExecutionPolicy Bypass -File tools/run-spine-portable-cli.ps1 -CheckActivated
npm run cli:roundtrip:c010
```

便携启动器通过 `--` 转发 CLI 参数，并保留同一套 Portable 配置。项目副本的直接 `app/Spine.com` 仍然视为禁止入口；成功标准是桥接脚本的激活检查、导出产物检查和 4.3.13 Runtime 回读全部通过。

官方参考：

- [Getting started](https://en.esotericsoftware.com/spine-getting-started)
- [Command line interface](https://en.esotericsoftware.com/spine-command-line-interface)
- [Export](https://en.esotericsoftware.com/spine-export/)
- [Version changelog](https://en.esotericsoftware.com/spine-changelog/archive)
- [Reinstallation and license page](https://en.esotericsoftware.com/spine-reinstallation)
