# 产品 Canvas 路径

`roomwave/` 的 Gaming c010 房间通过 `/runtime/` 加载 `spine_runtime/src/canvas/`，与 AIRI 单页演出的 WebGL 路径独立。

| 文件 | 职责 |
|---|---|
| `character-pack-loader.js` | 从 `/config/character-registry.json` 解析 Character Pack 和资源 URL |
| `roomwave-spine.js` | Spine 加载、authored 擦脸、其余程序化动作、IK、Canvas 绘制与协调 |
| `action-scheduler.js` | 有限动作标识、阶段、完成和中断 |
| `anchor-sampler.js` | 语义角色到骨骼世界坐标和屏幕坐标 |
| `trace-recorder.js` | 有上限的动作轨迹缓存 |
| `vendor/` | 产品使用的 Spine Canvas 4.3.13 运行库及许可 |

房间先调用 `loadCharacterPack()`，创建 `SpineCharacterAdapter` 并 `load()`。房间的帧循环调用 `update(deltaSeconds)`，并负责激活、暂停、尺寸变化与页面生命周期。`playSemantic()` 启动有限动作，`interruptToIdle()` 处理中断，`getAnchor()` 和 `captureTrace()` 提供锚点与证据。

加载时选择 skin 后计算一次真实几何 bounds 并缓存，resize 据此适配镜头。c010 的默认 skin 只有点附件，导出的 skeleton header bounds 为零，不能把它当成可见人物范围；实际镜头使用 skin `00`。

当 `recipes.foam_wipe.source.type` 为 `authored-animation` 时，适配器从 `source.animation` 播放真实 clip。加载入口检查该动画、`FoamNotice/FoamContact/FoamCleared/FoamComplete` 事件和 `foamFace/foamPalm` 语义锚点，缺失直接报告加载错误。

擦脸在 track 1 单次播放，track 0 保持 idle；完成和中断混出，重复触发替换当前动作。时间与事件取自真实 TrackEntry，scheduler 只维护标识、阶段和完成状态。该动作期间跳过旧骨骼生成、constraint mix 强制和手部 IK，泡沫只读锚点绘制。水与风继续使用现有运行时配方。源素材、许可和候选发布信息由 `resources/characters/` 与 `spine_manager/` 维护。

当前 Canvas 逐三角片裁剪绘制会在部分网格（如腿部）留下细的抗锯齿接缝，AIRI WebGL 没有这项可见问题。功能验收不代表两条路径画质相同；本次未改写旧 Canvas 渲染器。

本路径保留实际使用的适配器和测试。早期通用 Facade、Pose Composer、任意动作分层等草案不属于已实现模块，也不是迁移工作的新增范围。
