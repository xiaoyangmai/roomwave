# Studio Operating System Adaptation

本工作台借鉴 `Donchitos/Claude-Code-Game-Studios` 的组织方式，但不复制它的规模。

## 采用的思想

- 用单一项目配置固定模型、Spine 编辑器、runtime、严格程度和自动化模式。
- 用阶段目录和产物清单驱动流程，而不是依赖长对话记忆。
- 用垂直委派组织 Agent，用横向咨询提供意见，跨领域冲突向上汇总。
- 用 Hook 检查写入位置、资产格式、Agent 产物和运行状态。
- 把 Agent、Prompt、工具和工作流本身加入回归测试。
- 用 checkpoint 保存运行状态，压缩、崩溃或中断后可以从产物恢复。

参考：[Claude-Code-Game-Studios](https://github.com/donchitos/claude-code-game-studios)

## 不复制的部分

- 不预先创建几十个 Spine Agent。
- 不用大量文档代替真实导出、回放和视觉检查。
- 不把所有阶段门都做成建议性提示。
- 不要求用户参与逐帧修整。
- 不把软件工程领域的角色名称直接当作 Spine 美术能力。

## 本项目的对应关系

| Studio 思想 | Spine Studio 对应物 |
|---|---|
| `project.yaml` | `configs/spine-studio.yaml` |
| workflow catalog | `workflows/studio-catalog.yaml` |
| agents | `agents/` 下的领域角色 |
| skills | `tools/` 和阶段命令 |
| hooks | 变更前、导出后、Agent 停止后的检查 |
| studio-tests | `evals/` 中的 Prompt、工具、Agent 回归集 |
| session state | `runs/<run-id>/run-state.json` |
| skill-improve | 失败分类后的一变量改进和回归循环 |

## 自动化边界

派生工程中的可逆修改可以自动执行。生产版本提升必须通过硬 Gate。结构不正确、证据缺失或结果无法重放时，系统保留上一版并输出 `BLOCKED`，不会通过继续添加补丁伪造成功。
