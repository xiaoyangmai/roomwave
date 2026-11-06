# 生产证据

当前验证基线：

- `c010-runtime/foam-wipe-runtime-report.json`：产品 Canvas 泡沫配方完成、中断、回 idle 的轨迹。
- `c010-loop-only-review/`：默认 idle 的桌面、窄屏、DPR 2 截图与运行结果。
- `../artifacts/runs/action-c010-20261031-foam-wipe/`：保留的 Rigby2D 动作候选源、生产报告和泡沫配方视觉记录。

历史报告的时间和浏览器 URL 记录的是当次环境。它们证明已有验证基线，不代表重构后又执行了一次浏览器验收。当前执行结果以重新运行验证脚本为准。

`foam_wipe` 的 Rigby2D authored 动画仍是离线候选；产品当前播放的是 Canvas runtime recipe。两条证据不能互相替代。
