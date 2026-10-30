# 参考图局部编辑模板

这个模板不绑定具体厂商。它可以连接支持参考图、mask 和透明输出的图像模型 API，也可以由 Photoshop/Krita 脚本执行。默认不使用 SAM 2、ComfyUI 或 ControlNet。

## 输入

- `source_rgba.png`：从 atlas/attachment 得到的透明部件。
- `mask.png`：优先来自原始 alpha、Spine attachment bounds 或 mesh；不让模型猜编辑范围。
- `reference_images/`：角色、服装、手部和材质参考。
- `pose_spec.json`：手腕、肘、接触点、遮挡关系和目标尺寸。
- `prompt.txt`：只描述要改变的局部结构。

## 请求

```json
{
  "source": "source_rgba.png",
  "mask": "mask.png",
  "references": ["character.png", "costume.png", "hand-contact.png"],
  "prompt": "same character and costume; three-quarter hand reaching toward the cheek; preserve sleeve, strap, colors and line weight",
  "background": "transparent",
  "quality": "high",
  "candidateCount": 8
}
```

如果模型不支持可靠 seed，就保存请求参数、响应 ID 和输出 hash，不能把结果称为完全可重复。

## 自动后处理

1. 用 Pillow/OpenCV 将输出限制在 `mask` 内合成，mask 外像素直接保留源图。
2. 清理透明 RGB 污染、边缘溢色、非预期连通区域和尺寸变化。
3. 对候选做轮廓、颜色、身份、姿势和边界评分。
4. 只有通过硬门槛且独立评分置信度足够的候选，才进入 `assets/approved/`。
5. 进入 Spine 试绑后再次做极限姿势回放。

## 选择模型的原则

优先选择支持“参考图 + 局部 mask + 透明输出”的编辑模型，而不是单纯文生图模型。模型的画质不能替代 mask 外像素保持、输出元数据和可回放性。
