# Roomwave 人物运行时

本工程负责角色加载、有限动作、文字演练、音频播放和演出生命周期。产品房间与用户状态属于 `roomwave/`，素材属于 `resources/`，制作与发布属于 `spine_manager/`。

当前主入口是 AIRI / c010 单页演出。它复用根目录 `airi/` 的固定上游源码和 Spine WebGL。既有 Gaming c010 房间继续使用 `src/canvas/` 的 Canvas 适配器，两条路径分开维护。

真实模型服务与 TTS 尚未接入。五种固定脚本用于检查文字、ACT 反应、中断和下一轮；固定 WAV 只验证本地播放及说话轨道，不把用户文字转为语音。

## 目录

```text
spine_runtime/
├─ src/stage/     c010 配置、单页演出、对话和固定演练
├─ src/canvas/    产品 Gaming c010 使用的 Canvas 适配器及 vendor
├─ scripts/       准备上游与素材、启动、生成固定语音
├─ patches/       对固定 AIRI 源码的持久补丁
├─ tests/         对话、Canvas 和单页浏览器回归
├─ docs/          当前行为、资源需求和 Canvas 接口说明
└─ public/        生成的 c010.zip 与 speech.wav，不提交
```

`airi/` 是仓库根的嵌套上游项目，固定提交为 `9e7917d9c660f4e8e05d3c04a5f71fe316c39b49`。本工程仅安装实际入口依赖，不安装完整 AIRI monorepo。上游改动同时保存在 `patches/airi.patch`。

## 启动与准备

在仓库根目录执行首次准备：

```powershell
npm --prefix spine_runtime ci
npm --prefix spine_runtime run prepare:source
```

准备脚本检查固定上游版本、应用补丁并连接依赖，从 `resources/characters/c010_00/character-pack.json` 读取模型、atlas 和纹理，生成本地 ZIP。Windows 首次准备还会用系统语音生成测试 WAV。

候选包预览可将 `ROOMWAVE_C010_PACK` 设为包含 `character-pack.json` 的绝对目录，再执行 `prepare:source`；这只替换本地生成的 ZIP，不发布正式资源。

以后执行：

```powershell
npm --prefix spine_runtime start
```

唯一入口为 <http://127.0.0.1:5180/>。启动器只运行 Vite，不启动产品房间服务或媒体服务。背景由 Vite 直接引用 `resources/assets/`。

## 当前能力与边界

- `src/stage/c010.ts` 集中资源、skin、三个反应、说话动作与混合参数。
- `src/stage/stage.vue` 管理本页控件、实际动画、AudioContext 和生命周期；加载入口一次检查精确动画名与 skin。
- `src/stage/conversation.ts` 复用 AIRI 聊天编排、语音分段和队列，管理当前轮次、内存历史与取消。
- `src/stage/rehearsal.ts` 提供五个经过同一 ACT 解析入口的固定场景。

“擦掉泡沫”播放素材内的 `foam_wipe`，与情绪共用 track 1。加载时检查动作、四个 Foam 事件与脸/手锚点；素材缺失时明确显示原因并禁用该按钮，其余演出仍可用。泡沫随实际动画时间与锚点绘制，不修改骨骼，也不另开帧循环。新输入、中断、暂停和重复触发沿用现有取消与混出。

“暂停互动”中断当前回答与声音、禁用输入，但基础 idle 继续。“恢复互动”保留模式与历史，等待新输入，不续播旧内容。刷新开启新会话，卸载释放模型与音频。

反应属于完整角色动画，不是独立脸部层；说话不是音素口型。当前不实现房间导航、礼物、账户、远端输入、观看流或多实例托管。`window.roomwaveStage` 仅供调试。

详细说明：[有限行为](docs/C010-RUNTIME.md)、[对话生命周期](docs/CONVERSATION.md)、[资源需求](docs/C010-RESOURCE-REQUEST.md)、[Canvas 路径](docs/CANVAS.md)。

## 验证

```powershell
npm --prefix spine_runtime run build
npm --prefix spine_runtime run test:conversation
npm --prefix spine_runtime run test:canvas
npm --prefix spine_runtime run test:browser
npm --prefix spine_runtime run test:foam-wipe
npm --prefix spine_runtime run test:foam-canvas
npm --prefix spine_runtime run record:foam-wipe
```

浏览器测试需要已启动的 5180、Chrome 与本工程 Playwright。`CHROME_PATH` 指定浏览器，`ROOMWAVE_AIRI_EVIDENCE_DIR` 指定输出目录。回归覆盖人物加载、演练、自然收尾、替换、中断、暂停恢复、实际音频能量、窄屏、刷新与卸载。

`test:foam-wipe` 要求当前 ZIP 含完整 authored 擦脸素材，输出截图、事件/轨道结果及 ZIP、skeleton 的 SHA256。预览调试可用 `roomwaveStage.seekFoam(seconds)` 暂停定位，`resumePreview()` 恢复正常帧播放。

`record:foam-wipe` 暖机后只录一次完整动作，使用 Playwright 页面录像，包含真实舞台背景和效果层；录制期间不要并行构建、截图或运行其他浏览器测试。需 Playwright 的 FFmpeg 组件，以及 PATH 中的 `ffprobe`（可用 `FFPROBE_PATH` 指定）。落盘后核对视频时长、帧数与时间戳间隔，输出 `foam-wipe-page.webm` 和 `recording-report.json`；机器检查不代替视觉评审。

`test:foam-canvas` 使用已启动的产品服务（默认 4173，`ROOMWAVE_BASE_URL` 可覆盖），正常请求正式资源。显式设置 `ROOMWAVE_C010_PACK` 时，才在浏览器测试中替换该角色包请求为候选文件；不修改磁盘正式包。输出默认进入系统临时目录，也可用 `ROOMWAVE_AIRI_EVIDENCE_DIR` 指定。

2026-11-02 的单页历史报告位于 `D:/CodexTemp/roomwave-single-stage-20261102/qa/stage-report.json`。功能通过不等于长时间演出、所有动作组合或正式发布已经验收。旧共享流实验与服务桥已移除。
