# c010 首轮派生 mutation 结果

本记录对应 run `foundation-baseline-20261029`。它是工作台的第一个可复现执行样本，不代表已经可以把派生项目替换回生产源。

## 做了什么

- 从 c010 4.3.26 导出的骨骼数据建立独立派生候选。
- 将原来的 `ik_arm_r` 目标骨迁移为 `hand_target_r`。
- 新增 `strap_target_r`，先复制原有目标骨的初始姿态和动画轨迹，确保候选不会因为迁移而直接丢动作。
- 将 `ik_arm_r` 约束改成两段链 `[r_arm_3, l_arm_2]`，目标改为 `hand_target_r`。
- 将 `string_2` 的变换来源改为 `strap_target_r`。
- 使用项目内 Spine 4.3.26 Portable CLI 导入新的 JSON，再导出并用 Spine Runtime 4.3.13 读回。

## 已经证明

- 导入和导出进程均成功。
- 目标骨语义已经分开：不再存在名为 `ik_arm_r` 的目标骨，同时存在 `hand_target_r` 和 `strap_target_r`。
- 手部 IK 和背带变换来源已经分开，结构图中不再有同一个目标同时被 IK 和 Transform 约束使用。
- 原有动画轨迹已迁移到手目标，并复制到背带目标；10 个动画仍存在。
- 骨骼、插槽、皮肤、事件、附件、网格附件和约束数量保持预期，只增加 1 根控制骨。
- Runtime 读回成功：311 根骨骼、141 个插槽、3 个皮肤、10 个动画、1 个事件、66 个约束，Spine 数据版本 4.3.26。
- 生产源文件未被修改。intake 记录的源哈希与执行后的实际哈希一致。

## 还没有证明

- 这不是视觉验收。尚未证明手、枪、背带在关键姿态中的像素级位置和遮挡完全正确。
- 这不是隔离动作验收。`strap_target_r` 当前复制了旧手目标的轨迹，目的是保留基线；下一步需要分别改变手目标和背带目标，测量对方是否不动。
- 目标的最小、默认、最大范围尚未从 golden pose 校准。
- 已执行 motion-build：从 10 个现有动作提取时长、骨骼/插槽/约束轨迹摘要，并生成 hand-only、strap-only、gun-only、hand-to-face、maximum-reach、interrupt-and-recover 六个隔离测试规格；这些仍是待回放规格，不是已通过的动作候选。
- visual-gate 已按同 run 证据协议阻断：当前缺少同一次回放的关键帧、逐帧轨迹、指标、golden pose、五角色独立复核和裁决文件。

## 证据位置

- 执行报告：`runs/foundation-baseline-20261029/execution-report.json`
- 结构验收：`runs/foundation-baseline-20261029/structural-report.json`
- 迁移差异：`runs/foundation-baseline-20261029/mutation-diff.json`
- 派生 Spine 项目：`runs/foundation-baseline-20261029/mutation-candidate/c010_00.mutation.spine`

## 下一步

当前主线停在 visual-gate。下一次必须先为同一个 run 采集固定输入回放、关键帧、逐帧指标和独立复核，再决定是否进入 adversarial-gate；当前生产项目保持不变。

motion-build 证据：

- `runs/foundation-baseline-20261029/motion-spec.json`
- `runs/foundation-baseline-20261029/motion-build.json`
- `runs/foundation-baseline-20261029/visual-verdict.json`
- `runs/foundation-baseline-20261029/adversarial-verdict.json`
- `runs/foundation-baseline-20261029/release-manifest.json`
