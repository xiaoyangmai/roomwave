# c010 Spine 审计与最小动作试作

来源：外部 c010 源素材；产品仓库只保留已验证的运行时导出物。

访问：<http://127.0.0.1:4173/spine-audit/c010/index.html>

## 文件

- `MODEL-AUDIT.md`：模型能力审计和当前结论。
- `audit-report.json`：主模型、aim、cover 三个导出骨架的详细结构清单。
- `semantic-binding.json`：语义角色、动作通道和 `foam_wipe` 试作定义。
- `model/`：只读复制的 `c010_00.skel/.atlas/.png`，原始桌面文件未改动。
- `index.html` + `app.js`：最小运行时试作。
- `vendor/spine-canvas-4.0.31.min.js`：用于浏览器试作的 Spine 4.0 runtime。

## 当前试作

- `idle` 在 Track 0 循环。
- `foam_wipe` 在运行时移动 `ik_arm_r` 目标，让手部向 `face_con` 目标移动。
- `face_con` 接收表情倾斜信号。
- 泡沫先用 Canvas 覆盖层绑定到脸部语义锚点。
- 点击页面按钮可以切换已有动画和运行时动作。

## 当前限制

- 当前可编辑的 `c010_00.spine` 位于外部 Spine Lab；本轮没有修改它，只替换了 Roomwave 使用的关联导出副本。需要做编辑时由 `C010_SOURCE_ROOT` 或资源生产工作台的输入路径提供。
- `aim` 和 `cover` 作为同目录中的独立导出一起记录，但最小试作使用主模型 `c010_00`。
- 左右手视觉方向需要在页面上人工确认一次。
- runtime 使用 4.0.31 解析 4.0.47 导出数据；正式接入前仍需锁定编辑器与 runtime 的大版本，并重新导出最终资源。
