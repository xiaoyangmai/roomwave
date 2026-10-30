# c010 Spine 模型能力审计

生成时间：2026-10-28T08:50:07.625Z
原始目录：外置 Spine Lab 中的 c010 源工程；本产品目录不携带原始工程。

## 结论

主模型是 Spine 4.0.47 导出的二进制骨架，不是只包含一张图片的简单模型。它有 310 根骨骼、141 个插槽、6 个 IK、60 个变换约束、10 个现有动画和 264 个网格附件。模型已经具备面部控制、头发链、双臂、手指、道具和统一身体/脸部控制目标，适合接入语义动作生成器。

当前源目录已包含 `c010_00.spine`（Spine 4.0.47）以及对应的分层 PNG 和运行时导出物。现在可以建立派生编辑工程并回写控制层；正式发布仍需在编辑器中新增两段式手部 IK、独立背带目标并重新导出。

## 文件清单

| 文件 | 版本 | 骨骼 | 插槽 | 动画 | IK | Transform | 网格 |
|---|---:|---:|---:|---:|---:|---:|---:|
| c010_00.skel | 4.0.47 | 310 | 141 | 10 | 6 | 60 | 264 |

## 主模型语义候选

| 语义角色 | 候选骨骼 | 状态 | 备注 |
|---|---|---|---|
| root | root | available | — |
| torso | body_2, body_1, center | available | — |
| neck | neck_1 | available | — |
| head | head | available | — |
| faceTarget | face_con, face_con_re | available | — |
| bodyTarget | body_con, body_con_re | available | — |
| pelvisTarget | pelvis_con, pelvis_con_re | available | — |
| armVisualRight | shoulder_l, l_arm_1, r_arm_2, r_hand_1 | available | 需确认 |
| armVisualLeft | shoulder_r, r_arm_1, r_arm_3, l_arm_2, l_hand_1 | available | 需确认 |
| handTarget | ik_arm_r | available | — |
| gun | gun | available | — |
| mouth | lip_3 | available | — |
| eyeLeft | — | missing | — |
| eyeRight | — | missing | — |
| browLeft | l_brow, r_brow | available | — |
| browRight | r_brow, l_brow | available | — |
| hairFront | f_hair_1, face_top | available | — |
| hairBranches | f_hair_1, f_hair_1_d2, f_hair_1_d4, f_hair_1_d, f_hair_1_d3, f_hair_1_d5, f_hair_2, f_hair_3 | available | — |
| fingers | l_hand_1, r_hand_1, r_finger_1, r_finger_2, r_hand_3, r_hand_2, r_finger_3, r_finger_4 | available | — |

## 主模型现有动画

| 动画 | 时长 | 时间线 | 主要目标 |
|---|---:|---:|---|
| action | 3.1667s | 1650 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| angry | 3.3333s | 1626 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| delight | 3.3333s | 1626 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| expression_0 | 3.1667s | 1649 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| idle | 3.3333s | 1628 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| special | 3.3333s | 1625 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| talk_end | 0.0333s | 8 | face2, lip_2, lip_1, face3, head, teath, teath2 |
| talk_start | 0.5333s | 8 | lip_2, face3, lip_1, face2, head, teath, teath2 |
| think | 3.3333s | 1627 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |
| worry | 3.3333s | 1628 | acc_1, acc_1_1, acc_1_2, acc_1_3, acc_2, acc_3, acc_3_1, acc_4 |

## 本轮最小试作

- 基础轨道使用现有的 `idle` 动画。
- 生成一个 `foam_wipe` 语义动作，不修改原始骨架文件。
- 通过现有 `ik_arm_r` 目标骨骼生成手部路径。
- 通过 `face_con` 生成面部反应信号。
- 泡沫在试作中先作为 Canvas 覆盖层，验证动作与语义锚点的连接。
- 左右手的视觉方向需要在页面中确认一次，因为模型的骨骼命名和屏幕左右不是完全一致。

## 需要保留的验证证据

- `audit-report.json`：完整骨骼、插槽、约束、附件和动画清单。
- `semantic-binding.json`：语义角色、动作通道和试作阶段。
- 页面中的结构调试信息和动作阶段状态。
- 原始模型文件保持不变，试作只在运行时驱动目标骨骼。
