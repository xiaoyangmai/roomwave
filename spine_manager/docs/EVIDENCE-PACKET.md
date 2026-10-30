# Roomwave 角色证据包协议

这份协议规定每次 c010 动作试作、房间回放和视觉复核必须留下什么。证据包的目的不是让 Agent 写一份更长的报告，而是让另一个 Agent 能在不知道生成过程的情况下重放、阅读和质疑同一个结果。

## 目录结构

每次运行写入 `artifacts/runs/<runId>/evidence/`，至少包含：

```text
run-manifest.json
action-spec.json
model-runtime.json
keyframes/
  clean-before.png
  clean-start.png
  clean-contact.png
  clean-release.png
  clean-idle.png
  debug-start.png
  debug-contact.png
  debug-release.png
frame-trace.jsonl
console.jsonl
browser-console.jsonl
metrics.json
trace-analysis.json
runtime-hand-ik.json
role-review/
  motion-animator.json
  technical-artist.json
  art-director.json
  product-reviewer.json
  adversarial-reviewer.json
adjudication.json
regression.json
```

`npm run pipeline:c010` 会把最近一次房间回放的关键帧、轨迹和清单复制到上述目录；`evidence/c010/` 只是便于查看的最新缓存，不能和另一次运行的文件拼包。流水线在依赖或启动阶段失败时也会生成最小证据包，并把缺失项写成 `status: "missing"`，避免失败运行看起来像没有运行过。

文件名可以增加版本或动作后缀，但不能删除这些证据类别。截图和轨迹必须来自同一次运行，不能把不同 seed、不同视口或不同模型 hash 的文件拼成一包。

## 根清单格式

```json
{
  "schemaVersion": 1,
  "runId": "c010-r07-foam-wipe",
  "room": "gaming_c010",
  "action": "foam_wipe",
  "modelHash": "sha256:...",
  "exportVersion": "4.3.26",
  "runtimeVersion": "@esotericsoftware/spine-canvas@4.3.13",
  "viewport": {"width": 1280, "height": 1000, "deviceScaleFactor": 1},
  "seed": 17,
  "camera": {"scale": 1, "x": 0, "y": 0},
  "inputs": ["foam button click", "interrupt at 1.25s"],
  "files": ["action-spec.json", "frame-trace.jsonl", "metrics.json"],
  "status": "review"
}
```

`action-spec.json` 必须写出动作意图、目标接触点、预期移动对象、必须保持不动的对象、效果锚点和中断恢复条件。`model-runtime.json` 记录 Spine 工程/导出/runtime 的版本和 hash，不能只写“当前版本”。

语义 smoke 和视觉验收分开记账：五个按钮的发射结果可以由动作矩阵和运行时 smoke 证明，但 G2/G4 仍要求每个需要视觉判断的动作有同一 run 的开始、接触、释放和回 idle 证据。只有 smoke、没有关键帧/轨迹的动作必须标为 `visual_evidence_missing`，不能因为按钮映射正确就把视觉门记为通过。

`trace-analysis.json` 由 `npm run trace:analyze` 从同一份房间回放清单生成。它逐动作报告准备、接触、回收阶段，以及手部目标位移、可见手位移、目标与可见手的接触误差、背带位移和解释标签。它是 G1/G2 的事实层证据；它不能替代 G3 结构检查或 G4 多角色观感复核。

## 逐帧记录

`frame-trace.jsonl` 每行代表一帧或一个采样点，至少包括：

```json
{
  "frame": 75,
  "time": 1.25,
  "activeTracks": ["idle", "foam_wipe"],
  "semanticTargets": {"hand": [412, 286], "face": [405, 301]},
  "visualAnchors": {"hand": [397, 322], "foam": [405, 301]},
  "constraintMix": {"hand_ik": 1, "strap": 0},
  "effects": ["foam"],
  "phase": "contact"
}
```

产品房间的基线 trace 和动作专用 trace 可以同时存在；每行要带 `source`，动作专用记录还要带 `action`，这样复核者能知道它来自整房间回放还是某个动作的固定采样。

截图中的每个问题都必须能对应到 `frame`、`time` 和一个区域。没有时间和区域的“看起来不自然”不能直接成为整改依据。

中断、重复点击和回 idle 也要落到可复核的记录里：至少保留中断前动作、被替换动作、恢复后的 idle 采样，以及对应的输入时间。测试脚本只在内存中断言而没有写入 run evidence 时，只能算 G1 smoke 结果，不能算 G2 恢复通过。

## 四道门

### G1：确定性运行和语义门

检查加载、版本、路由、按钮、动作存在、控制台、共享目标、效果锚点和回 idle。崩溃、版本错配、未声明共享目标或语义动作缺失直接失败。

### G2：动作与时间门

检查准备、加速、接触、停留、回收、打断和恢复。动作必须一眼可读，目标移动必须传递到可见手部或道具，不能只移动一个不可见控制点。

### G3：结构、服装和材质门

检查衣服、背带、枪械、头发、关节、网格、遮挡、透明边缘、材质和角色身份。穿插、拉伸、断裂、闪烁、身份漂移和明显服装结构破坏不能用审美高分抵消。

### G4：人类视觉观感门

检查剪影、构图、节奏、表情、角色气质、视觉重点和直播交互是否符合目标风格。该门由多角色视觉复核完成，但不能覆盖 G1 到 G3 的硬失败。

发布条件是 G1、G2、G3 全部通过，G4 没有重大分歧，并且裁决结果不是 `review`、`fail` 或 `blocked_visual_uncertainty`。

## 多角色复核格式

每个角色只看证据包、动作规格和参考图，不看生成 Agent 的解释。输出必须包含：

```json
{
  "role": "motion-animator",
  "decision": "review",
  "confidence": 0.84,
  "scores": {"semantic_intent": 4, "motion_naturalness": 3},
  "findings": [
    {
      "kind": "INFERENCE",
      "frame": 75,
      "time": 1.25,
      "region": "right hand and cheek",
      "finding": "手已经到脸旁，但接触停留不足，擦拭意图不够清楚",
      "severity": "P1"
    }
  ],
  "unknown": [],
  "recommendations": ["延长接触停留并重新回放 foam_wipe"]
}
```

必须至少有动画、技术美术、视觉导演、产品和对抗五个角色。任一维度分歧超过 1 分、置信度低于 0.8、出现互相矛盾的结论，或存在 `UNKNOWN` 未解决时，进入第三次复核或标记 `blocked_visual_uncertainty`。

自动流水线可以先生成五个 `role-review/*.json` 占位文件，但它们必须明确写成 `status: "not-run"`、`decision: "not-run"` 和未解决的 `UNKNOWN`。占位文件只证明证据包结构完整，不能算独立视觉复核通过；只有真实的盲审结果才能把对应角色改为 `pass`、`review` 或 `fail`。

## 调试闭环

```text
冻结模型/版本/视口/seed
  -> 写动作规格和单一可证伪假设
  -> 只改变一个变量
  -> 固定输入回放
  -> 运行 G1 硬检查
  -> 采集关键帧、trace、日志和指标
  -> 多角色盲审 G2/G3/G4
  -> 裁决并标记 FACT / INFERENCE / UNKNOWN
  -> 通过则冻结证据，失败则按错误标签进入下一轮
  -> 连续三轮无改善则阻断并报告缺失素材或工程能力
```

生成 Agent 不能读取视觉评审理由来“迎合评分”；评审 Agent 不能修改模型。所有修复都要回到新 run，并保留上一版证据和回滚指针。

当独立评审在流水线结束后到达时，使用 `npm run review:freeze -- --run-id <runId>`。它只接受与 `run-manifest.json` 相同的 `runId`，校验五个角色的 decision 枚举和置信度，并把角色文件复制到该 run；缺失、过期或低置信度会保留 `blocked_visual_uncertainty`，不会被自动改成通过。
