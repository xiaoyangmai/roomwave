# c010 推进状态

更新时间以最近一次命令输出为准。这里记录证据和阻断项，不把“页面能显示”写成“模型已经可发布”。

当前目标基线：**Spine 4.3.26**。4.0.47 原始工程和旧导出物只作为只读回滚轨；4.3.26 迁移副本已经保存、导出，并由 4.3.13 runtime 回读和实际渲染。

最近完整流水线：`artifacts/runs/c010-20261029T115833Z/run-summary.json`。`cli-policy`、Portable 激活检查和 c010 导出/回读阶段全部通过；流水线随后在既有 water 手部锚点烟雾检查处停止（约 15px，高于 12px 阈值），发布状态仍为 `blocked-or-needs-review`。本轮证据明确记录 4.3.26 工程、Portable CLI 导出物和 4.3.13 runtime；视觉复核仍按既定门禁等待独立裁决。

## 已完成

- **P0 输入冻结**：4.0.47 `c010_00.spine` 保留为只读回滚源；4.3.26 派生工程已成为当前可编辑基线，Roomwave 使用 `@esotericsoftware/spine-canvas@4.3.13`。
- **语义适配器**：`../src/runtime/roomwave-spine.js` 通过 `semantic-binding.json` 解析 `handTarget`、`faceTarget`，并记录动作轨迹，不把 Roomwave 按钮绑定到模型专用骨骼名。
- **最小动作试作**：Roomwave 内 `/spine/c010/` 支持原始动画、`foam_wipe`、`water_splash`、回到 `idle`；原始模型文件保持只读。
- **当前目标调整**：最终交付从“单独展示 c010”调整为独立的 `gaming_c010` 直播间；原版 `gaming-seated` 继续作为对照，`/solo/?spine=c010` 保留为兼容/调试入口。
- **Gaming c010 产品房间**：`gaming-c010-room.js/css` 已完成第一版接入；上方保留原版平台小游戏，下方换成 c010 Spine 角色，保留 Star、Banana、Water、Foam、Fan 五个交互，并把原版房间、c010 审计页和兼容入口分开验证。
- **Gaming c010 回刷修复**：`gaming-c010` 已从“仅直达预览”改为正常轮换房间；离开后再次滚动/导航会保留房间节点并重新激活，`smoke-runtime` 增加了离开后回到 c010 的回归检查。
- **手部/背带隔离证据**：`evidence/c010-hand-only-string-off.json` 已确认 `ik_arm_r` 和 `string_2` 的共享目标风险，发布状态保持阻断。
- **运行时隔离 fallback**：`../src/config/c010-runtime-patch.json` 在 Roomwave 试作层把 `string_2` 的 Transform 混合设为 0，并标记为 `provisional-runtime-only`；原始 `.skel` 未修改。
- **视觉复核素材**：`evidence/c010/review-manifest.json` 固定采集独立审计页和 `gaming_c010` 产品房间的 idle、Star、Banana、Fan、Foam、Water、各动作释放、中断恢复、420×760 窄屏和 CPU 降速低帧率帧；本轮五角色复核已冻结，但 G4 仍保留 review。
- **纹理门槛执行器**：`tools/check-texture-gates.py` 已把配置中的像素、alpha、边缘、轮廓和帧闪烁门槛变成 Pillow 检查；身份/材质模型指标保持明确的待复核状态。
- **原始素材拆分**：`tools/extract-atlas-regions.py` 可从 c010 atlas 生成带源坐标、旋转和 alpha mask 的 region 素材清单，为局部补图提供可追溯输入。
- **无人值守编排**：`tools/run-pipeline.mjs` 已将清单、素材拆分、纹理门槛、约束证据、运行时 smoke 和视觉帧采集串成带 runId 的一次执行。
- **Portable CLI 固化**：自动化禁止直接调用未激活的 `app/Spine.com`；`cli:policy` 扫描执行代码，`editor:check-c010` 先检查 Portable 配置激活，`cli:roundtrip:c010` 通过 `tools/run-spine-portable-cli.ps1` 执行导出和回读。
- **Portable CLI c010 回读**：`evidence/c010/portable-cli-export.json` 和最新 run 证据记录导出退出码 0，4.3.26 JSON/atlas 经 4.3.13 Runtime 核心回读，310 bones、141 slots、3 skins、10 animations、6 IK、60 transform constraints、4 atlas pages 全部匹配。
- **可见手部审计**：语义绑定新增 `handVisual=l_hand_1`，轨迹同时记录目标点和可见手部；`proof:hand-reachability` 已证明目标移动约 140.5 像素时可见手部只移动约 8.2 像素，当前一段式 IK 不能完成触脸。
- **视觉证据分离**：采集脚本现在按动作阶段精确抓取 clean/debug 两组关键帧；`evidence/c010/codex-vision-review.json` 记录了当前多模态复核，结论为拒绝，原因是手部接触不可读且仍不是独立审查。
- **源工程检查**：`source:check-c010` 已确认新源目录包含 `c010_00.spine`，并记录对应的 4.0.47 导出物和 00/01 分层 PNG；旧的无 `.spine` 运行时模型目录和旧 atlas 拆分素材已删除。
- **版本基线切换**：目标基线已改为 4.3.26；`configs/c010-version-migration.json`、`configs/goal-loop.json`、`configs/room-action-matrix.json` 和 `tools/spine-tool.json` 已改为 4.3.26 迁移策略，4.0.47 保留为只读回滚轨。
- **多页皮肤接入**：4.3.26 新导出包含四个 atlas 页面和 `00/01` 皮肤；适配器、Solo 房间和审计页现在按页面加载纹理并选择 `00` 皮肤，避免只显示效果标记而角色为空。
- **可重复审计**：`source:audit-c010` 可从导入的 `.spine` 关联导出物重建审计、语义绑定和运行时副本。
- **4.0.47 派生工作区**：已创建 `source/nikke_4.0.47/derived/c010_roomwave_4.0.47/`，原始工程保持只读，后续编辑器修改只进入派生副本。
- **编辑器环境检查**：项目内 4.3.26 副本可启动并保存；后续自动化只使用 Portable CLI 桥接，不再调用未激活的直接 `Spine.com`。
- **4.3.26 迁移副本**：已建立并保存 `source/nikke_4.3.26/derived/c010_roomwave_4.3.26/`，输入来自 4.0.47 派生工程；4.0.47 源和旧派生目录未改动。
- **历史 CLI 探针**：旧的直接 `Spine.com` 激活失败记录保留作环境事实；它们不是当前自动化入口，当前入口改为已激活的 Portable CLI 桥接。
- **迁移完成**：已创建 `../src/spine-audit/c010/model-4.3.26/` 的 JSON、atlas 和四张纹理页；`c010-migration-4.3.26-export.json` 记录 4.3.13 runtime 回读和浏览器实际渲染通过。
- **4.0.47 版本请求复核（历史）**：旧证据中的 `Spine.com --update 4.0.47 --version` 返回 `WARNING: Not activated`，没有下载 4.0.47 编辑器；该记录仅用于说明过去的许可证阻断，不得作为后续自动化入口。
- **运行库版本复核**：检查公开 `@esotericsoftware/spine-canvas` 版本列表，没有 4.0.47，4.0 分支最高可用为 4.0.31；证据见 `evidence/c010-runtime-version-probe.json`。因此不能用更高主次版本冒充冻结基线。
- **安装尝试**：官方公开试用入口只提供 4.3.26，无法提供 4.0.47；试用版已卸载，没有让 4.3 进入当前项目工具链。
- **安装方案调研**：`configs/c010-editor-install-options.json` 和 `docs/EDITOR-INSTALL-OPTIONS.md` 已确认推荐路径是完整许可证页安装器；当前 4.3.26 便携候选只作为迁移工具，项目脚本只允许从 `tools/spine-4.3.26/SpinePortable.exe` 启动，不能直接调用下载目录。
- **Goal 闭环协议**：新增 `configs/goal-loop.json`、`tools/record-goal-turn.mjs`、`tools/checkpoint-review.mjs` 和 `docs/GOAL-LOOP.md`；第 5、10、15、20、25、30 轮等会在本轮开始前重新读取方案/方法文档并生成检查点，缺证据时 fail-closed。
- **冷启动验证**：新增 `startup:smoke`，在临时端口启动并关闭独立 Roomwave 后端，检查 Solo、Spine 和审计路由；已有 4173 服务不再被误当成启动验证。
- **依赖闭环**：新增 `configs/dependencies.json` 和 `tools/ensure-dependencies.cjs`；当前 Node 运行库 4.0.31、Pillow 12.3.0 均已通过检查，无需安装。每次流水线先记录依赖版本，缺失或越界时才自动安装。
- **房间级里程碑（第一版已落地）**：`spine-c010-room.js/css` 继续作为独立审计页；`gaming-c010-room.js/css` 已把 c010 重组为 `gaming_c010` 产品房间，复用 Gaming 的直播结构和五类按钮语义。当前仍是可运行试作，动作自然度和手部可达性尚未达到发布门槛。
- **动作轨迹分析**：`tools/analyze-room-trace.cjs` 已把产品房间的固定回放转换为目标位移、可见手位移、目标与可见手接触误差、背带位移和阶段覆盖报告；最新 run 中 `foam_wipe`、`water_splash` 均为 `provisional_motion_consistent`，Star/Banana 记录为无手部接触反应，Fan 记录为稳定 hold；发布仍受视觉与永久骨架门阻断。
- **运行时两段式 IK 试作**：`../src/config/c010-runtime-patch.json` 现在声明一个可回滚的 `r_arm_1 → l_arm_2 → l_hand_1` 运行时 fallback；最新 `runtime-hand-ik.json` 记录 foam/water 目标与可见手误差约 1px，背带仍低于阈值。该证据改善了 Roomwave 试作，但不等价于编辑器内永久改骨架。
- **中断与恢复验证**：产品房间现在暴露受控的 `resetToIdle()` 调试入口；运行时 smoke 覆盖 foam 被 water 立即打断、回 idle 和 fan 快速重复点击，当前结果分别为 `water_splash`、`idle`、`fan_hold`。
- **房间路由证据**：`evidence/c010-room-routing.json` 由 headless runtime smoke 生成，记录三个房间的当前面板、画布、动作轨迹和原版 Gaming 五个按钮；它与冷启动证据一起证明这次是房间接入，而非单页展示。
- **运行级证据冻结**：`tools/run-pipeline.mjs` 每轮把本轮清单、动作规格、模型/runtime 信息、关键帧、逐帧 trace、控制台记录、指标、五个角色的 `not-run` 占位、裁决和回归状态写入 `artifacts/runs/<runId>/evidence/`；缺阶段时写 `missing`，不会复用上一轮截图冒充本轮结果。
- **同 run 视觉复核冻结**：`tools/freeze-independent-reviews.cjs` 已校验并冻结 `c010-20261028T232518Z` 的五个角色；`adjudication.json` 裁决为 `blocked_visual_uncertainty`。当前证据包已移除过期 `fan-isolated.png`，浏览器控制台为空，风扇逐帧锚点误差约 1.4px，泡沫和低帧率/窄屏释放提示已明确为完成语义。剩余未决项是低帧率接触/长按、窄屏其他动作和重复点击覆盖，以及源工程仍是运行时 fallback、回归基线尚未接受。
- **四道门与多角色复核协议**：新增 `docs/EVIDENCE-PACKET.md`、`configs/visual-review-roles.json`，并把 G1 确定性运行/语义、G2 动作/时间、G3 结构/服装/材质、G4 人类视觉观感写入视觉 rubric、Agent 流水线和调试闭环。最新 run 的 G1 工具检查和动作事实层通过；G4 按协议被 `blocked_visual_uncertainty` 阻断，没有被平均分掩盖。

## 当前阻断

新导入的 `c010_00.spine` 已完成 4.3.26 保存、导出和 4.3.13 runtime 回读。当前仍有两类发布阻断：模型依然只有一段式 `ik_arm_r`，且 `string_2` 与手部目标共享约束；另外，迁移后的产品房间还需要重新跑动作轨迹、纹理门槛、四道门和五角色视觉复核。当前运行时两段式 IK 仍是可回退的试作补丁，不能替代 Spine 工程内的永久改骨架。

## 下一优先级

1. 在已保存的 4.3.26 工程中实现两段式手部 IK 与独立 `strap_target_r`；当前运行时 fallback 只能作为对照实验。
2. 用 4.3.26 导出物重跑 Fan 的手持道具/空间锚定、release/recover 轨迹、窄屏和低帧率回放，再让五角色复核重新裁决 G4。
3. 完成 hand-only、strap-only、gun-only 和真实连续网格/权重证据；重新导出后重跑 manifest、可达性和隔离实验。
4. 根据通过/拒绝样本校准纹理、身份和材质门槛，并继续保留中断恢复和固定 trace 回归。
5. 最后生成带回滚指针的发布 manifest；在此之前，任何 provisional runtime patch 都不能发布。

## 可重复检查

在 `Roomwave/spine_manager` 执行：

```powershell
npm run manifest:c010
npm run source:check-c010
npm run validate
npm run proof:hand-strap
npm run proof:runtime-isolation
npm run proof:hand-reachability
npm run smoke:runtime
npm run capture:review
npm run trace:analyze
npm run texture:self-test
npm run assets:extract-c010
npm run pipeline:c010
```

当前预期结果是：运行时 smoke 通过，结构验证为 `needs-review`，原始工程手部/背带证据仍为 `shared-target-confirmed`；Roomwave fallback 的 `runtime-hand-ik.json` 应显示 foam/water 可见手误差低于 12px，但它仍是 `provisional-runtime-only`。视觉裁决为 `blocked_visual_uncertainty`，这是有意保留的阻断状态。

`validate:strict` 当前按预期返回失败，因为上述共享目标和不可达手部仍未被修复；这不是流水线崩溃，而是发布门槛生效。
