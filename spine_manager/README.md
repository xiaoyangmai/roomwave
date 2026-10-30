# Spine Manager

这里是 Roomwave 的独立资源生产工作台，存放 Spine 模型构造、补图、语义绑定、动作生成和验证资料。它位于产品代码外层，和 `src/spine-audit/c010` 分工不同：

- `spine-audit/c010` 保存 4.3.26 当前模型的审计结果、导出物和浏览器试作；旧 4.0.47 导出物保留在 `model/` 作回滚。
- `spine_manager` 保存如何把模型变成可维护、可验证、可接入 Roomwave 的工作台资料。
- 工作台可以读取 `src/spine-audit` 的产品导出物做验证，但不会把产品运行时代码放回工作台目录。
- 原始 `.spine` 工程保持在外部 Spine Lab；需要验证可编辑源工程时，将 `C010_SPINE_PROJECT` 指向具体文件。Portable 和本地 MCP 也通过外部环境或 Codex 注册提供，不复制到本仓库。
- 原始 `.skel/.atlas/.png` 不在这里直接改写。没有 `.spine` 工程时，先做运行时实验；需要改骨骼、IK、权重或插槽时，建立可编辑的派生工程。

## 现在的判断

当前产品使用 Spine 4.3.26 导出的 `c010_00.json`，并由 `@esotericsoftware/spine-canvas@4.3.13` 回读。模型有可用的 `ik_arm_r`，但它不是一个可以直接当作“手部目标”的干净接口：

- IK `ik_arm_r` 控制 `l_arm_2`。
- Transform 约束 `string_2` 又以 `ik_arm_r` 为目标，旋转、X、Y 混合都是 1。
- 插槽 `string_3` 挂在 `string_2` 上。

所以当前试作中目标一动，背带先明显移动。这是约束图和语义绑定需要隔离的问题，不是简单的左右手方向或缓动问题。

## 新工作台基线

本项目现在按 `Spine Studio Foundation` 的架构推进：

- [架构和方法论基线](docs/SPINE-STUDIO-FOUNDATION.md)
- [Studio 工作室架构借鉴说明](docs/STUDIO-OPERATING-SYSTEM-ADAPTATION.md)
- [统一配置](configs/spine-studio.yaml)
- [阶段目录](workflows/studio-catalog.yaml)
- [参考资产入口](reference-corpus/README.md)
- [c010 首轮派生 mutation 结果](docs/FIRST-MUTATION-RESULT.md)
- [Codex 编排方式](docs/CODEX-ORCHESTRATION.md)
- [外部参考落地矩阵](docs/EXTERNAL-REFERENCE-MATRIX.md)
- [本机 MCP 接入记录](docs/LOCAL-MCP-SETUP.md)

工作方式是 `assistant-operated`：大模型由当前 Codex 会话承担，项目内脚本只作为确定性取证、执行和验收工具。你不需要逐条运行下面的命令；需要推进时由我代为调用，并根据产物决定下一步。

第一条已运行的纵向切片是 `foundation-baseline-20261029`：它对当前 c010 的 4.3.26 派生工程完成了素材哈希、导出 JSON 取证、约束图、语义控制契约、可回滚 rig 计划，以及首轮派生 mutation 的导入、导出和结构验收。它没有修改原始 `.spine` 工程；视觉动作验收仍在后续阶段。

## 目录

| 路径 | 用途 |
|---|---|
| `docs/MODEL-CONSTRUCTION-PLAN.md` | 从审计到可用模型的阶段计划和素材补画方法 |
| `docs/ASSET-RECOVERY-AND-GENERATION.md` | 缺手部角度时的原始素材、局部重绘、自动筛选和 Spine 绑定流程 |
| `docs/DEBUG-LOOP.md` | 如何记录证据、隔离变量、回放和验收 |
| `docs/RUNTIME-CONTRACT.md` | Roomwave 语义动作、锚点和效果层接口 |
| `docs/AUTOMATED-EXPERT-PIPELINE.md` | 无人工修整时的 Agent 编排、补图闭环和独立验收 |
| `docs/VISION-REVIEW-RUBRIC.md` | 大模型观感评估、分层评分、分歧门和主动校准 |
| `docs/EVIDENCE-PACKET.md` | 四道门所需的统一证据包、逐帧记录和多角色裁决格式 |
| `docs/PROGRESS.md` | 当前阶段、证据、阻断项和下一优先级 |
| `configs/c010-control-plan.json` | 当前 c010 的约束风险、待确认目标和补图计划 |
| `../src/config/c010-runtime-patch.json` | 没有 `.spine` 工程时的临时运行时隔离补丁 |
| `configs/model-invariants.json` | 可机器检查的 Spine 领域规则 |
| `configs/calibration.json` | 阈值校准集、已知坏样本和变更记录策略 |
| `configs/room-action-matrix.json` / `configs/visual-review-roles.json` | 房间动作契约、视觉角色清单、评分维度和分歧规则 |
| `tools/validate-pipeline.mjs` | 检查审计、语义绑定和约束共享风险 |
| `../src/runtime/roomwave-spine.js` | Roomwave 的语义动作适配器和动作轨迹记录 |
| `tools/create-model-manifest.mjs` | 生成模型文件哈希、导出版本和结构计数清单 |
| `tools/check-texture-gates.py` | 用 Pillow 执行 mask 外泄、alpha、边缘、轮廓和闪烁检查 |
| `tools/extract-atlas-regions.py` | 从 c010 atlas 提取带来源坐标的 region 和 alpha mask |
| `tools/run-pipeline.mjs` | 用 runId 串起清单、素材、门槛、约束、运行时和视觉证据 |
| `tools/analyze-room-trace.cjs` | 把 gaming_c010 固定回放的逐帧轨迹转成动作位移、接触误差和背带稳定性报告 |
| `tools/freeze-independent-reviews.cjs` | 校验同一 run 的五角色盲审、置信度和 decision 枚举，并生成裁决状态 |
| `configs/goal-loop.json` | Goal 目标、四级完成状态和每五轮复盘协议 |
| `configs/dependencies.json` / `tools/ensure-dependencies.cjs` | 检查并按需安装 Node 运行库和 Pillow，记录版本证据 |
| `tools/record-goal-turn.mjs` / `tools/checkpoint-review.mjs` | 连续轮次记录、方案重读、证据快照和 fail-closed 门禁 |
| `tools/startup-smoke.cjs` | 临时端口冷启动 Roomwave 并检查路由和进程清理 |
| `workflows/image-model-edit-template.md` | 不绑定具体厂商的参考图局部编辑模板 |
| `assets/` | 原始拆分图、遮罩、生成候选、审核通过图和 Spine 导出物的分区 |

## 检查命令

在 `Roomwave` 目录执行：

```powershell
node spine_manager/tools/validate-pipeline.mjs
node spine_manager/tools/create-model-manifest.mjs
node spine_manager/tools/smoke-runtime.cjs
node spine_manager/tools/analyze-room-trace.cjs
node spine_manager/tools/prove-hand-strap.cjs
node spine_manager/tools/prove-runtime-isolation.cjs
node spine_manager/tools/capture-review-frames.cjs
python spine_manager/tools/check-texture-gates.py --self-test
python spine_manager/tools/extract-atlas-regions.py
node spine_manager/tools/run-pipeline.mjs
node spine_manager/tools/startup-smoke.cjs
node spine_manager/tools/ensure-dependencies.cjs
npm --prefix spine_manager run studio:intake -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:forensics -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:contract -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:plan -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:prepare -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:execute -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:structural -- --run-id foundation-baseline-20261029
npm --prefix spine_manager run studio:status
```

这条命令不会修改模型。它会报告语义角色是否存在、`handTarget` 是否和背带约束共享目标，以及无人值守 Agent 流水线是否有完整阶段和修复上限。加 `--strict` 可以让未解决的共享目标直接返回失败，适合在提交前使用。

Roomwave 内的运行时试作页是 `http://127.0.0.1:4173/spine/c010/`。它通过同一份语义绑定和 c010 的 4.3.26 JSON 导出加载模型；正式发布前仍要完成手部与背带的隔离证明。

Roomwave 的正式产品入口是 `http://127.0.0.1:4173/solo/?room=gaming_c010`；`?spine=c010` 保留为兼容入口，不带参数时固定显示第一张原版 `gaming-seated` 对照画面。`smoke:runtime` 会同时回放产品房间、审计入口、默认对照和旧版 Gaming，检查语义动作轨迹。

`proof:hand-strap` 会对同一条手部位移轨迹做两次实验：背带 Transform 约束开启一次、关闭一次。结果写入 `evidence/c010-hand-only-string-off.json`，当前预期是确认共享目标并保持发布阻断。

`proof:runtime-isolation` 验证 Roomwave 试作页加载的临时运行时补丁：手部目标移动时，`string_2` 不再被 `ik_arm_r` 直接带动。它是可回退的运行时措施，不等价于正式 Spine 工程导出。

`capture:review` 会固定采集审计页和 `gaming_c010` 产品房间的 idle、foam 的注意/接触帧和 water 接触帧，写入 `evidence/c010/review-manifest.json`，供独立视觉评估器读取；随后 `trace:analyze` 生成 `evidence/c010/trace-analysis.json`，把动作目标和可见手的实际位移分开报告。它不会把视觉模型的主观判断伪装成结构通过。

`texture:self-test` 会运行一组小型基准图，确认纹理门槛脚本本身可用。真实候选图必须显式提供 base、candidate 和 mask；身份相似度、材质相似度仍会标为待模型复核，不会被脚本冒充通过。

`assets:extract-c010` 会把原始 atlas 按 region 拆到 `assets/source/c010/regions`，同时生成同名 alpha mask 和 `region-manifest.json`；它不修改 `.atlas`、`.png` 或 `.skel`。

`pipeline:c010` 是当前无人值守闭环入口。每次执行会在 `artifacts/runs/<runId>/` 保存各阶段日志、`run-summary.json` 和一份冻结的 `evidence/` 证据包；截图、轨迹和清单只从本次运行复制，缺失阶段会明确写成 `missing`。即使所有自动步骤通过，只要模型仍处于 `needs-review` 或视觉复核未独立完成，也不会标记可发布。

房间入口现在分开：`/solo/` 固定显示原版 `gaming-seated` 对照画面，`/solo/?room=gaming_c010` 是正式的 c010 Gaming 直播间，`/solo/?spine=c010` 是兼容入口，`/solo/?room=gaming` 是旧版 Gaming 对照房间。默认轮播不会再把两套 Gaming 画面交替展示；c010 产品房间的按钮只发送语义动作，不改变原始 Spine 文件。

流水线的第一阶段是依赖检查：只有发现缺失或超出配置范围的版本才会调用 npm 或 pip 安装；检查结果写入 `artifacts/dependency-check.json`，不会重复安装正确版本。

Goal 开启后，每个有效往返记录一轮；第 5、10、15 轮等在本轮开始前重新读取方案和方法文档：

```powershell
cd Roomwave/spine_manager
npm run goal:turn -- --turn 1 --summary "本轮要回答的问题" --priority "当前最高优先级"
```

规则、检查点和四级完成状态见 `docs/GOAL-LOOP.md`。当前目标基线为 4.3.26；4.0.47 只作为只读源和回滚轨，迁移完成前不会把输入副本冒充为已导出 4.3 资源。

## 完成标准

模型只有同时满足下面条件，才算“能用在 Roomwave”︰

1. 角色层能稳定循环 `idle`，动作按钮可以被打断并回到 `idle`。
2. 手部目标、脸部目标、道具目标、背带目标是独立语义接口。
3. 泡沫、水、风扇效果绑定到语义锚点，而不是绑定到某个碰巧会动的插槽。
4. 相同模型版本、动作版本和随机种子可以重放出相同轨迹。
5. 结构检查、浏览器自动检查和独立视觉审查都通过。

