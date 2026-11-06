# Roomwave 资源生产

本模块把可追溯的输入整理成产品资源，负责检查、派生、验证与候选接入。用户状态和房间逻辑属于 `roomwave/`；角色行为与渲染属于 `spine_runtime/`。

## 目录

```text
spine_manager/
├─ source/c010/       当前 Spine 4.3.26 导出与 Rigby2D 工作文件，生产时不覆盖
├─ tools/             loop-only、动作候选、推广、截图和校验入口
│  └─ validation/     当前 JSON 审计与手/背带变体检查
├─ configs/           Rigby2D 操作约定、动作需求、视觉审核角色
├─ schemas/           现有 loop-only 包约束
├─ patches/           固定版本 Rigby2D 的最小修补及重建说明
├─ tests/             真实工作文件的 JSON 回读回归测试
├─ evidence/          当前可复核的运行轨迹和视觉基线
└─ artifacts/runs/    生产批次输出；当前保留 foam_wipe 候选源及证据
```

产品资源统一放在 `../resources/`：`assets/` 是场景图片，`audio/` 是音频，`characters/` 是角色包，`config/` 是注册表和当前必要配置。总索引是 `resources/index.json`。浏览器 URL 仍使用 `/assets/`、`/audio/`、`/character-packs/` 和 `/config/`。

## 两条生产路径

Loop-only：`source/c010 → Rigby2D MCP 检查 → Character Pack → 浏览器循环验证 → resources/characters → 注册表`。默认只确认 `idle`，其他动画必须明确确认语义后才对产品开放。

动作制作：`source/c010/c010_00.rigby → author 脚本制作新 .rigby → 完整 JSON/atlas/PNG 导出 → 候选 Character Pack → 运行时与视觉验收 → promote 接入 resources`。原始输入不覆盖。Rigby2D 是仓库内的独立工具项目；制作和导出脚本直接调用它的工作文件、骨骼与图集库，检查使用其 MCP 工具实现，不要求 Spine 官方 GUI。

生成或编辑图片及纹理使用 Grok Build，具体约定见[项目协作约定](../AGENTS.md)。生成图片是候选素材，须记录真实来源，并在绑定和运行时画面中验证。c010 擦眼重做的制作经验与当前失败证据见 [v3 制作记录](configs/c010-foam-wipe-v3.md)。

按问题加载制作/检查 skill 的详细方法；本轮可复用经验、Grok/Spine 排障和候选测试入口集中在[动作方法索引](configs/animation-method.md)，无需默认读取全部历史批次。

2026-11-06 已在本机复测 Grok 图片任务和 Spine 工程读取：Grok 使用 MCP 工作区内的参考图完成了完整手套生成，调用方式及限制见 [Grok 恢复记录](artifacts/runs/c010-grok-recovery-20261106/README.md)；本机 Spine 便携包装器使用 `--wait --` 向 Spine 转发参数，原始 4.0.47 工程副本可导出为 4.3.26 JSON，命令及比较结果见 [Spine 恢复记录](artifacts/runs/c010-spine-recovery-20261106/README.md)。两项复测均不证明此前超时或启动失败的唯一原因，也不代表新动作通过视觉验收。

资源目录目前是 `c010_00@0.4.0` 候选；其 `foam_wipe` 时长 3.6 秒，保留原 10 个动作，事件为 `FoamNotice@0.1`、`FoamContact@1.1`、`FoamCleared@2.15`、`FoamComplete@3.6`。0.4.0 的视觉验收已撤销：擦眼时掌向不成立，肩肘连接也不清晰。后续 0.5.0 与多组姿势试验同样尚未通过视觉验收，不能将功能测试通过当作动作完成；最新结果和证据以 [v3 制作记录](configs/c010-foam-wipe-v3.md)为准。

0.3.0 是袖片整片单骨绑定的旧技术原型，其历史 pass 不作为自然度基线。0.4.0 的制作过程见 [重做任务单](configs/c010-foam-wipe-v2.md)，视觉结论以 v3 记录中的复审为准。`foamPalm` 为兼容原接口保留名称，实际锚点跟随弯曲食指的指节。foam 声明 `authored-animation`，Water/Fan 保留现有 patch 路径及未支持状态。新批次的功能、录像和视觉记录均按导出模型 hash 核对。

## 命令

首次安装：`npm install --prefix spine_manager`。本模块统一安装 `spine-core`、`spine-canvas` 4.3.13 和浏览器验证所需 `playwright-core`；旧审计目录不再有独立依赖包。

`rigby2d/` 是独立 Git 项目，不随 Roomwave 根仓库提交。缺少该目录时，在仓库根目录恢复当前固定版本：

```powershell
git clone https://github.com/jaisurya-dev-art/rigby2d.git rigby2d
git -C rigby2d checkout f0ff6918902c10f0d18262d1b97a12b5fd8df7ec
npm ci --prefix rigby2d
git -C rigby2d apply ../spine_manager/patches/rigby2d-terminal-key-curve.patch
```

已有 Rigby2D 工作区时先检查其本地修改，不用上述命令覆盖工作文件。普通包完整性检查和产品运行不要求启动编辑器；生产命令需要上述本地依赖。

当前最小上游修补及验证见 [patches/README.md](./patches/README.md)。它只修正末帧无效曲线引起的回读误报，不修改动画或导出值。

在仓库根目录执行：

```powershell
npm --prefix spine_manager run validate
npm --prefix spine_manager run validate:strict
npm --prefix spine_manager run test:variant
npm --prefix spine_manager run audit:c010
npm --prefix spine_manager run loop-only:c010
npm --prefix spine_manager run loop-only:promote:c010 -- --run-id <run-id>
npm --prefix spine_manager run capture:loop-only-review
npm --prefix spine_manager run test:roundtrip
```

`audit:c010` 只读取输入，将结构报告写入 `evidence/c010-runtime/`。`build:variant` 从不可变输入重建产品隔离变体；已有输出时默认拒绝覆盖，明确重建时设置 `FORCE=1`。

制作完成的 `.rigby` 用 `node spine_manager/tools/export-rigby-json.mjs INPUT.rigby OUTPUT.json` 导出。输出必须位于 `spine_manager/artifacts/`，脚本生成同名 JSON、atlas、PNG 和导出报告，重新打包工作文件里的实际纹理，并逐像素核对输出。JSON 结构、资源引用和回读必须通过；binary `.skel` 不支持的特性只作为信息记录。本命令证明文件完整性，不代替动作或视觉验收。

### 0.4.0 历史 authored 动作批次

以下命令对应未通过视觉验收的旧批次，只用于复现或检查其文件；不得用于推广当前制作中的新动作。

以下完整命令依次执行 `tools/author-c010-foam-wipe-v2.mjs`、完整导出和候选组包；会重建同一批次的制作结果，人工调整工作文件后应改用后面的单独导出方式。

```powershell
npm --prefix spine_manager run action:c010
```

保留已调整好的 `.rigby`，只导出并更新候选：

```powershell
node spine_manager/tools/export-rigby-json.mjs spine_manager/artifacts/runs/c010-foam-wipe-v2-20261105/authored/c010_00.foam_wipe.rigby spine_manager/artifacts/runs/c010-foam-wipe-v2-20261105/exported/c010_00.foam_wipe.json
npm --prefix spine_manager run action:c010 -- --stage-only
```

批次中的 `authored/` 保存可编辑工作文件，`exported/` 保存完整导出和像素/回读报告，`pack/` 保存 0.4.0 候选清单、绑定与实际模型。组包只写 `artifacts`，不会替换产品资源。`--stage-only` 重新核对导出报告的文件 hash，再生成候选。

候选必须在 AIRI/WebGL 和 Canvas 中加载，检查完整动作、清除泡沫、重复触发、打断与回待机，并人工查看脸手接触、袖子/绑带和原动作表现。功能回归运行 `npm --prefix spine_runtime run test:foam-wipe`；`capture:action-review` 复用 `spine_runtime/tests/record-foam-wipe.cjs`，暖机后只录一次完整播放，期间不并行构建、截图或其他浏览器测试。需要 Playwright 的 FFmpeg 组件和 `ffprobe`（可设 `FFPROBE_PATH`），落盘检查真实时长、帧数和时间戳，不能自动判定视觉通过。`ROOMWAVE_AIRI_EVIDENCE_DIR` 指定视频及 `recording-report.json` 输出目录。

采集前先准备运行时 ZIP 并启动 5180 服务，在另一个终端运行采集：

```powershell
# 推广前设置当前候选；不设置时默认正式 resources 包
$env:ROOMWAVE_C010_PACK = "$PWD/spine_manager/artifacts/runs/c010-foam-wipe-v2-20261105/pack"
npm run runtime:prepare
npm run runtime:start
# 另一个终端
npm --prefix spine_manager run capture:action-review
```

默认准备正式资源包；`ROOMWAVE_C010_PACK` 指定候选目录。报告中的 `skeletonSha256` 应与当前 `pack/character-pack.json` 一致；准备和采集均不改正式资源。

最终验收写入同批次的 `runtime/foam-wipe-runtime-report.json` 和 `visual/review-manifest.json`，两者必须有 `status: "pass"` 和与候选模型一致的 `skeletonSha256`。运行报告汇总两条运行路径；视觉报告保留实际检查结论及证据。导出之后任何模型调整都需要重新导出、组包和验收。

```powershell
# 只检查最终候选和同一模型的证据，不写正式资源
npm --prefix spine_manager run action:promote:c010 -- --check
# 验收完成后接入本地产品；前一版本完整包移到本批次 rollback/c010_00
npm --prefix spine_manager run action:promote:c010
```

推广同步角色注册表版本，资源总索引仍指向同一注册入口。包保持 `candidate`，不意味着发布许可通过。旧配方批次的测试和自动视觉通过脚本已退休，当前命令统一复用运行时回归。

Canvas 产品回归 `test:product` 复用 `spine_runtime/tests/test-foam-canvas.cjs`，需要先运行 Roomwave 服务：

```powershell
node roomwave/backend/server.cjs
# 另一个终端；与实际服务端口一致
$env:ROOMWAVE_BASE_URL = "http://127.0.0.1:4173"
npm --prefix spine_manager run test:product
```

Canvas 测试默认连接 `http://127.0.0.1:4173`，用 `ROOMWAVE_BASE_URL` 与实际服务地址对齐。默认加载正式 `resources/characters/c010_00`；推广前可设置 `ROOMWAVE_C010_PACK` 为候选 `pack` 的绝对目录，测试通过浏览器路由加载该候选。两条测试均使用本机 Chrome 和 `spine_runtime` 的依赖，可用 `CHROME_PATH` 指定浏览器。测试与采集不启动或关闭服务。

## 发布与来源

普通 `validate` 证明当前文件和入口完整；`validate:strict` 还把 runtime patch、未确认许可、未确认锚点、未支持动作和未发布状态视为阻断。这些阻断保留，目录整理不会替它们作出批准。

每批产物保留版本、输入 hash、检查与视觉证据。`promote` 只是把候选接入本地产品，并不授予发布许可。来源说明见根目录 `SOURCE-NOTICE.md`；原公开资源清单位于 `resources/mirror-report.json`。

`tools/sync-public-source.py` 把公开源重新抓取到 `source/public-mirror/` 供比对，不覆盖产品；`tools/fetch-gaming-assets.py` 是定向补齐已有 Gaming 图片的人工执行工具，输出到 `resources/assets/`。两者都不会自动批准来源许可。
