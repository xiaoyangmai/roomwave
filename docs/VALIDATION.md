# 验证

所有下列命令从仓库根目录执行。

## 人物运行时

```powershell
npm run runtime:prepare
npm run runtime:build
npm run test:conversation
npm run test:canvas
npm --prefix spine_runtime run test:foam-wipe
```

启动演出页后运行浏览器回归：

```powershell
npm run runtime:start
# 另一个终端
npm run test:runtime-browser
```

浏览器检查人物加载、五种演练、动作替换和收尾、中断、暂停恢复、实际音频能量、窄屏、刷新、卸载和错误输入。测试结果写到系统临时目录，可用 ROOMWAVE_AIRI_EVIDENCE_DIR 指定外部目录。

## 产品

```powershell
npm run check:product
npm start
```

使用 Solo 和 Together 入口检查首屏、房间切换、礼物/玩法、衣柜与资源请求。c010 需检查人物加载、泡沫动作、中断和回待机。

房间状态模型和共享 API 的边界见 roomwave/README.md。浏览器回归必须区分本地 c010 与参与共享模拟的六个正式房间。

## 内容生产

```powershell
npm run resources:validate
npm run resources:validate:strict
```

普通检查确认输入、候选包、依赖与证据完整；严格检查同时将当前发布阻断项作为阻断。功能检查通过不能代替资源声明与实际导出一致，也不能代替视觉接受或许可确认。

生产、捕获与候选推广命令见 spine_manager/README.md；这些命令可能生成输出或更新候选包，不属于只读检查。

## 变更验证范围

目录迁移至少检查模块构建、纯逻辑测试、静态资源端点以及浏览器实际入口。截图与测试临时文件存放在仓库外，不再积累到业务代码目录。

## 当前目录基线验收

2026-11-04 本地验收通过：

| 检查 | 结果 |
|---|---|
| 产品脚本与页面依赖 | 65 个脚本、86 个依赖通过 |
| 运行时准备与构建 | 固定 AIRI 补丁、ZIP、TypeScript 与 Vite 构建通过 |
| 对话与 Canvas 逻辑 | 11 项对话、2 项 Canvas 测试通过 |
| 产品浏览器回归 | 13 个页面检查、11 个互动检查，错误和资源失败均为 0 |
| Together 两客户端 | 同一鼓掌事件、计数与 revision 一致 |
| c010 产品动作 | 完成、中断、回 idle 和独立控制目标通过 |
| AIRI 浏览器回归 | 场景、声音、暂停恢复、窄屏和卸载通过，错误为 0 |
| 资源与文档 | 注册表版本、实际动画、文件、公开资源端点与本地链接通过 |

产品测试使用 4174，演出页使用 5180。Chrome / Playwright 检查了产品 1440×1000、390×844，以及演出页桌面和窄屏。当前未提供 Browser 插件，使用项目既有 Playwright。

外部证据：[产品报告](D:/CodexTemp/roomwave-restructure-20261104/product/report.json)、[演出报告](D:/CodexTemp/roomwave-restructure-20261104/runtime/stage-report.json)。检查结果不代表真实模型、TTS、正式发布或其他浏览器已经验收。

## c010 擦脸动作验收

2026-11-05 复审：**0.4.0 视觉验收失败，原通过标记已撤销。** 掌面朝向错误和上臂不可见使主姿势不成立。技术测试与图像采集成功不等于视觉判定正确；当前图像已经足够看出问题，执行检查时却被降格为素材限制和合理遮挡。

2026-11-05：0.4.0 重制候选已接入，模型 SHA256 为 `32cdacf5a54e2a27fe4b7c4e23a9b0f7ed78cbd1a297a17d09bfcc4441e3881c`。本轮导出回读、纹理校验、原动画/附件数据比对、双入口动作回归及运行时构建通过。AIRI 连续录像 201 帧、8.04 秒；模型查看有序抽帧与高清局部，观察范围和限制详见 [本轮视觉报告](../spine_manager/artifacts/runs/c010-foam-wipe-v2-20261105/visual/review-manifest.json)。本地候选检查不代表专业动画质量或发布许可验收。

以下为 0.3.0 的历史技术检查，不能继承为新版质量结论。

2026-11-04，资源包 0.3.0 使用真实 `foam_wipe`，技术原型模型 SHA256 为 `204e63d988d8724ca826c5415197d18c4b0ce563afe0a67555bb834501917bf3`。以下保留技术检查范围；自然动作质量未通过，历史视觉报告的 pass 不再作为表演验收结论。

- Rigby 源工程保留原十个动画和原附件；两袖新增动作专用绑定，现有纹理重排后像素一致。JSON、atlas、PNG 和回读通过。
- AIRI 验证四事件、完成回待机、重复触发、情绪替换、中断、新输入、暂停恢复和窄屏；Canvas 验证真实动画、清泡沫、重复/中断，以及水风原路径。
- Canvas 另检查实际皮肤几何、脸锚点在镜头内及非透明像素覆盖，避免只凭动作状态通过空白画面。
- 连续记录使用真实页面录像：254 帧、10.16 秒、最大帧间隔 40ms。该记录可以复核动作，但不能由录像完整或没有快速绕转推导自然度。旧袖片以整片单骨绑定消除了翻面，接触时腕指变化不足，衣料和全身联动需按 [重做任务单](../spine_manager/configs/c010-foam-wipe-v2.md) 重新制作。Canvas 旧三角片细缝另作为画质限制记录。

批次证据：[运行报告](../spine_manager/artifacts/runs/c010-foam-wipe-20261104/runtime/foam-wipe-runtime-report.json)、[视觉报告](../spine_manager/artifacts/runs/c010-foam-wipe-20261104/visual/review-manifest.json)。

复查当前产品包用 `npm --prefix spine_manager run test:product`；用 `ROOMWAVE_BASE_URL` 指定产品服务。连续视频单独用 `npm --prefix spine_runtime run record:foam-wipe`，不要在录制期间并行截图或构建。功能测试和录像采集不会自动授予视觉验收。
