# 外部参考落地矩阵

这张表区分三种状态：看过资料、吸收方法、真正接入工具。只有最后一种才算代码集成。

| 参考项目 | 当前状态 | 已吸收的内容 | 尚未做的事 |
|---|---|---|---|
| [donchitos/claude-code-game-studios](https://github.com/donchitos/claude-code-game-studios) | 架构层已吸收 | 单一配置、工作流目录、角色分层、阶段产物、checkpoint、失败后回归改进 | 没有复制它的 Agent 数量，也没有在项目内运行 Claude Agent runtime |
| [ampersante/spine2d-animation-mcp](https://github.com/ampersante/spine2d-animation-mcp) | 调研完成，尚未注册到当前 Codex | 作为 Spine 动画工具能力的候选参考 | 尚未在本机安装并注册 MCP server |
| [egorfedorov/spine-mcp](https://github.com/egorfedorov/spine-mcp) | 已安装并绑定 Portable；真实 MCP stdio 已验证，Codex 命名工具适配器仍阻塞 | 作为 Spine 4.3 CLI、可编辑 `.spine`、预览和 PSD/导出目录工具的候选参考 | 当前 Codex app-server 返回 `Transport closed`，需完整重载后再声称 Codex 命名工具 live 通过 |
| [1425sd/spine-MCP](https://github.com/1425sd/spine-MCP) | 已安装、已加载，c010 只读分析已验证 | 作为 Windows/stdio、JSON 动画和 corpus 工具的候选参考 | 其自带 CLI 基线偏 3.8.75，不能作为 c010 4.3.26 的生产 mutation 入口 |
| [Swarms tool](https://swarms.world/tool/972c4c25-5487-4939-84b5-7bb534231461) | 调研完成，尚未注册到当前 Codex | 作为外部 Agent 编排和工具封装的候选参考 | 尚未接入本机工具配置，也不会替代 Codex 主代理 |
| Spine 官方 CLI + `spine-core` | 已接入并验证 | 4.3.26 Portable CLI 导入、导出、4.3.13 Runtime 读回 | 视觉动作验收仍需继续建设 |

## 当前代码中的落地点

CCGS 的方法已经落到：

- `configs/spine-studio.yaml`：单一项目配置；
- `workflows/studio-catalog.yaml`：阶段和 Gate；
- `agents/`、`prompts/`、`knowledge/`：角色、提示词和长期知识分层；
- `runs/<run-id>/run-state.json`：阶段状态和恢复点；
- `docs/CODEX-ORCHESTRATION.md`：Codex 主代理、临时子代理和确定性工具的分工。

Spine MCP 项目目前按证据分层接入，没有把 stdio 通过冒充成 Codex 命名工具 live 通过。现在的真实执行入口仍是项目自己的确定性工具和 Spine Portable CLI：

- `tools/run-spine-studio.mjs`
- `tools/run-spine-portable-cli.ps1`
- `tools/export-c010-via-portable-cli.mjs`

本机安装位置（不属于 Roomwave 仓库）：

- `C:/Users/mi/.codex/local-mcp/egorfedorov-spine-mcp`
- `C:/Users/mi/.codex/local-mcp/1425sd-spine-mcp`

当前采用 Codex 主代理模式，但这不排斥本机 MCP。正确的接入方式是：把候选项目安装在本机并注册为 Codex 可调用的外部工具；项目本身不启动它们，也不把它们复制成自己的 Agent runtime。接入后先用只读检查和 c010 回归任务比较能力，证明它优于现有工具后再作为执行入口使用。
