# 本机 MCP 工具接入记录

本机 MCP 不属于 Roomwave 仓库，也不由 Roomwave 启动。Codex 通过 `C:\Users\mi\.codex\config.toml` 注册并按需启动它们。

## 已安装

### egorfedorov/spine-mcp

- 目录：`C:/Users/mi/.codex/local-mcp/egorfedorov-spine-mcp`
- 启动程序：`.venv/Scripts/spine-mcp.exe`
- 安装方式：`uv sync`
- 启动检查：stdio server 可正常启动
- 适合先验证：`inspect_source`、`preview`、`project_info`
- 当前绑定：`SPINE_BIN` 指向项目内 `SpinePortable.exe`，`SPINE_BRIDGE` 指向 `tools/run-spine-portable-cli.ps1`；CLI 调用统一经过 Portable profile。
- 当前证据：真实 MCP stdio 握手、派生 JSON 导入和派生项目导出均已通过；Codex 命名工具已经恢复连接，旧 server 的 doctor 通过但随后触发 Portable 联网更新，导致本轮 live 导入/导出失败；证据分别在 `runs/foundation-baseline-20261029/mcp-egorfedorov-live-stdio-evidence.json` 和 `runs/foundation-baseline-20261029/mcp-egorfedorov-live-codex-attempt.json`。
- 桥接修正：`spine_cli.py` 的 Portable 子进程使用独立输入，不继承 MCP 长连接的 stdin；`spine_doctor` 只读取本地 4.3.26 资产和依赖存在性，不启动会触发联网更新的 Portable `--version`；也不在 MCP 工作线程里导入 `psd_tools`。这些边界一起避免具体工具调用卡住。
- 限制：只验证派生副本，不能把它当作 c010 生产 mutation 入口；当前 Codex 命名工具适配器仍返回 `Transport closed`，所以合同只把服务器 stdio 标为通过，仍把 Codex 适配器标为阻塞。
- 可重复检查：`npm run mcp:egor:check -- --run-id foundation-baseline-20261029`。

### 1425sd/spine-MCP

- 目录：`C:/Users/mi/.codex/local-mcp/1425sd-spine-mcp`
- 启动程序：`build/index.js`
- 安装方式：`npm install`、`npm run build`
- 已通过：TypeScript typecheck、MCP `tools/list`，16 个工具注册成功
- 适合先验证：JSON 分析、只读 corpus 扫描和官方 CLI 调用边界
- 当前证据：`spine_analyze_json` 已对 mutation JSON 成功回读；`spine_scan_corpus` 可响应。动画建议接口报告 `knowledgeFound=false`，当前没有 learned guide/presets，因此不能把内建 preset 当作专家动作起点。
- 限制：仓库的 CLI 兼容性说明以 Spine 3.8.75 为基线，c010 是 4.3.26；当前没有设置 `SPINE_EXE`，不会直接触碰 c010。
- 依赖状态：非破坏性 `npm audit fix` 后仍有 1 个高危 `zod` 问题，修复需要破坏性主版本升级；因此暂不把它作为生产 mutation 工具。

## Codex 注册

注册项是：

```toml
[mcp_servers.spine_egorfedorov]
command = 'C:\Users\mi\.codex\local-mcp\egorfedorov-spine-mcp\.venv\Scripts\spine-mcp.exe'

[mcp_servers.spine_1425sd]
command = 'C:\Program Files\nodejs\node.exe'
args = ['C:\Users\mi\.codex\local-mcp\1425sd-spine-mcp\build\index.js']
```

Codex 不会热加载配置。重启 Codex 后，主代理才可以看到这两个 server 的工具列表。

本轮直接启动 server 做了真实 MCP stdio 验证；如果 Codex 的命名工具仍显示 `Transport closed`，需要完整重启 app-server 才能重建适配器连接，不能用离线 Python 调用冒充 live Codex 验证。

## 使用边界

1. 先用只读工具做 `c010` 结构和 JSON 分析。
2. 任何修改都只能写入 `runs/<run-id>/mutation-candidate-*`。
3. 生产源 `.spine` 不交给外部 MCP 直接写入。
4. 每个 MCP 的结果必须经过现有 Spine 4.3.26 Portable CLI 和 4.3.13 Runtime 回读。
5. 通过版本、结构、视觉和回滚回归后，才允许把某个工具提升为默认入口。
