# 动作技能方法复核（2026-11-07）

本轮只更新制作/检查技能与项目路由，没有修改动作或正式资源。通用指引位于 `C:/Users/mi/.codex/skills/animation-authoring/` 和 `animation-inspection/`；项目按需入口为 [动作方法索引](../configs/animation-method.md)。

## 格式与引用

两份技能均经 `skill-creator/scripts/quick_validate.py` 检查通过。技能与项目入口、方法索引及本记录中的 Markdown 本地文件引用均已核对存在；这只验证格式与路径，不证明制作判断正确。

## 独立场景试用

评审 agent 使用新上下文，按技能路由读参考；没有进行生成、产品修改或完整动画验收。

| 输入场景 | 实际决策 |
| --- | --- |
| 持杯角色抬手轻触脸，已有握拳/半张手两图和独立指骨 | 先验证解除接触、松握中间形及反向回握，核对腕口/掌根/活动指根与底图；有具体缺口才补图，不擅自增加擦拭或全面重绑。 |
| 候选改为 1.9 秒、换手，旧测试按 3.6 秒失败，特效盖住触点，用户认可整体 | 读当前时序和锚点父链，检查 pass 范围，做同状态去特效对照；保留用户认可的风格，接触未知不自动判错，也不推定通过。 |

以上是决策演练，没有声称执行这些假设场景的运行时检查。

## 已知图像样本回归

实际读取 [original](../artifacts/runs/c010-split-hand-prior-pose-20261106/0.650-original.png)、[split](../artifacts/runs/c010-split-hand-prior-pose-20261106/0.650-split.png)、[overlay](../artifacts/runs/c010-split-hand-prior-pose-20261106/0.650-overlay.png) 与 [条件记录](../artifacts/runs/c010-split-hand-prior-pose-20261106/evidence.json)。它们是同一版本、WebGL 4.3.13、skin `00`、`action` 0.650 秒的临时槽位覆盖诊断，非新导出动画。

首轮识别出黑色折叠拳指与红色伸指同时出现的重复手形，并指出 original→overlay 同时改变了 split 和 overlay，不能仅用这对图归因于覆盖。补读 split 后核实：两图均 `split=true, partial=false`，只改变 `overlay=false→true`；该对照支持此刻完整拳覆盖造成重复轮廓的判断。技能据此补入“多项同时改动只判断组合，单项归因再补对照”。

这是已标注案例与局部控制对照，不是盲测或正常动画的合格基线。结论不覆盖其他时刻、连续松握、人体工学或其他素材方案。

## 最终方法文件指纹

路径相对 `C:/Users/mi/.codex/skills/`；SHA256 用于辨认本次方法版本。

| 文件 | SHA256 |
| --- | --- |
| `animation-authoring/SKILL.md` | `4a20ed3e6686e4e464ed94b8d76ee3694ed94ca3b5ccae945e21c9caabe4b9c6` |
| `animation-authoring/references/pose-transition-production.md` | `0c9f314515130a616c7c4472c73e75334f808efef181456f9eb66f3a55e4ebab` |
| `animation-inspection/SKILL.md` | `78940c752f70b351bddb0cd9c6dcafb93ee8e86a4bfb57a11a541c2178eb0d73` |
| `animation-inspection/references/diagnostic-review.md` | `57b041f88029a4cc9f8213056d131b80307009ac78f7cfec1e8760672b95ac9a` |
