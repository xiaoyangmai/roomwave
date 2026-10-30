# 可选的节点式局部补画工作流模板

> 这份文件仅保留给已有本地节点式工作流的情况，不是本项目默认方案。默认方案见 `image-model-edit-template.md`，使用图像模型 API + 原始 mask + Pillow/OpenCV 硬合成。

这是一个参数模板，不是把某个模型文件写死的成品工作流。每次生成都要保存输入图、mask、prompt、seed、模型和输出候选。

## 输入

- `base.png`：当前 atlas 拆出的透明部件或关键帧。
- `mask.png`：只覆盖需要补画的手/前臂区域，边缘留少量羽化。
- `reference.png`：角色脸、服装和材质参考。
- `structure.png`：手臂轮廓、线稿或边缘控制图。

## 节点顺序

```text
Load base + alpha
  -> Crop around hand and forearm
  -> Load mask
  -> Canny or Lineart preprocessor (structure)
  -> Inpaint model / ControlNet inpaint
  -> Reference conditioning or character LoRA (optional)
  -> Generate 4-8 low-variation candidates with fixed seed family
  -> Upscale only after structure approval
  -> Composite back to transparent layer
```

## 提示词约束

提示词描述“要补的结构”，不要重新描述整个人物。示例：

```text
same character, same costume, same sleeve and glove design,
three-quarter hand reaching toward the cheek, clean anime line art,
consistent purple-gray palette, transparent background, no extra fingers
```

负面约束至少包含：`extra fingers, fused fingers, changed costume, new jewelry, text, background, blurry edge`。

## 审核顺序

1. 手指数量和关节方向。
2. 袖口、手套、背带与前臂的遮挡顺序。
3. 与原 atlas 的颜色、线宽和高光一致。
4. 放到 Spine 网格的极限姿势里是否露空、拉伸或穿插。
5. 是否只补了需要的区域，没有把不可控的背景带进透明图。

