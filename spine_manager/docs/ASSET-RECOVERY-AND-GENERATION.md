# 缺手部角度时的补图方法

## 原则

补图服务于动作和网格，不是为了“把一张图变成所有角度”。先确定动作需要的接触姿势，再只补能覆盖这些姿势的纹理。默认流程不要求用户人工挑图或修图：候选由独立检查器自动筛选，低置信度结果自动拒绝，无法通过时进入下一轮或切换预渲染 fallback。

## 最原始的素材

开始前尽量收集这些原始资料，而不是只拿当前 atlas 页面：

1. 原始 `.spine` 工程、导出设置和编辑器版本。
2. 未压缩的角色立绘、分层 PSD/KRA/CLIP 文件，以及手、前臂、衣袖、背带、枪的独立层。
3. 原始 atlas 页面和对应的 region/slot 清单。
4. 角色正面、三分之四侧面、手掌朝上/朝下、握持道具、触脸的参考图。
5. 服装和装备的结构参考：背带从哪里穿过肩膀，哪些部分在手臂前面，哪些部分在后面。
6. 目标动作的关键帧草图或视频参考，至少标出手腕、肘、肩、脸部接触点。
7. 颜色、线稿、材质和透明边缘规范；没有这些时，先从当前 atlas 采样建立色板。

如果只有 `.skel/.atlas/.png`，先把 atlas 按 slot 拆成透明 PNG，并把拆分结果标记为“推断层”，不能当作原始分层。

## 需要补哪些角度

按 Roomwave 的真实动作路径选择素材，通常从三到五个关键姿势开始：

- 休息位：手自然垂放或握住控制器。
- 接触位：手指和脸/泡沫的接触面清楚。
- 中间位：三分之四角度，保证从休息到接触不会突然露出空洞。
- 反向位：手背或前臂外侧在动作回收时可见。
- 道具位：握住手柄、枪或风扇时的遮挡关系。

若手部被前臂、袖口或背带遮住，不要整条手臂都生图；只补会暴露的区域，并保留一个可供 Spine 网格变形的安全边界。

## 推荐工具组合

### 参考图局部编辑：图像模型 API

当前优先使用支持“原图 + mask + 参考图 + 透明输出”的强图像编辑模型。它可以替代节点式生成器完成手部角度和局部材质补画；但 mask 仍由原始 alpha、Spine attachment bounds 或 mesh 提供，不能让模型自己猜边界。以 OpenAI Image API 为例，编辑接口支持输入多张参考图、mask 和透明背景：[Image edits](https://developers.openai.com/api/reference/resources/images/methods/edit)。

建议请求流程：

```text
source RGBA + original alpha/Spine mask
  -> crop hand/forearm region
  -> reference images + pose specification
  -> image-model edit API
  -> 4-8 candidate outputs
  -> Pillow/OpenCV mask-only composite
  -> alpha, boundary, color and identity QA
```

强生图模型能替代“画笔”，不能替代“尺子、剪刀和质检”：即使提供 mask，编辑结果也可能改变边界或 mask 外的内容。因此 mask 外像素必须用源图硬合成恢复，再做逐像素检查。

### 精确修补：Photoshop

适合做遮罩、边缘、色彩和小范围生成后的清理。先选区再生成，可以把修改限制在局部并保护未选区域；图层蒙版让修补保持可回退。官方说明分别见 [选区生成编辑](https://helpx.adobe.com/photoshop/desktop/make-selections/refine-modify-selections/use-selections-for-generative-editing.html) 和 [图层蒙版](https://helpx.adobe.com/photoshop/desktop/create-masks/layer-masks/add-layer-masks.html)。

Photoshop 适合：手指轮廓修正、袖口接缝、透明边缘、颜色匹配、生成结果的局部替换。不要把一个合并后的大图直接交给 Spine。

### 几何调整和程序化修补：Krita

适合把生图结果拉回可控的二维几何。Warp、Cage 和 Mesh 变形可以对手、袖口和前臂做局部校正，同时保留可见的控制点；官方文档说明了这些变形模式和网格控制：[Krita Transform Tool](https://docs.krita.org/en/reference_manual/tools/transform.html)。

Krita 适合：修正手臂长度、手掌朝向、袖口弧度和遮挡边界。无人流程中只通过预设脚本或导出的变形参数调用；如果没有可靠的自动化入口，就由 OpenCV/Pillow 处理，不能让用户临时手工修图。它不负责替代 Spine 权重绑定。

### Spine 编辑器

Spine 负责骨骼、网格、权重、IK、Transform/Physics 约束和导出。手部应先在编辑器里确认控制骨骼，再绑定纹理；不要因为生图角度看起来正确，就跳过骨骼和权重验证。Spine 官方对两骨骼 IK 的用途、目标骨骼和弯曲方向有明确说明：[IK constraints](https://us.esotericsoftware.com/spine-ik-constraints)。权重应在网格拓扑确定后处理，并用 Bind、Auto、Smooth、Prune 和规则化权重锁定逐步修正：[Weights view](https://eu.esotericsoftware.com/spine-weights)。

## 生成后的整理顺序

1. 保留原图、mask、prompt、seed、模型名和生成时间。
2. 只挑选结构正确的候选，不按“画面更漂亮”选择。
3. 用 OpenCV/Pillow 做透明边缘、色彩和尺寸清理；手指、袖口、武器握持和透明边缘由局部重绘轮次自动修复。
4. 按角色部件拆层：`hand_l`、`forearm_l`、`sleeve_l`、`strap_l`、`prop_grip` 等。
5. 用统一色板和像素尺寸导出透明 PNG。
6. 在 Spine 中创建网格、绑定权重、限制每个顶点的影响骨骼数量并做极限姿势测试。
7. 重新导出后跑 `validate-pipeline.mjs`、无头浏览器动作回放和独立审查器。

## 不需要用户参与的自动闭环

拆层器从 alpha 和 Spine 几何生成 mask，图像模型 API 批量生成候选，确定性检查器先做硬筛选，视觉审查器再做软评分，Spine 试绑器最后验证极限姿势。每轮保存输入、seed 或请求 ID、mask、请求参数、评分和关键帧；最多修复三轮。仍然失败时输出阻断原因，不把未经证明的图放入发布目录。

## 不采用的做法

- 不用一次全图生图来“顺便得到新姿势”，因为身份、服装细节和遮挡会一起漂移。
- 不把多个独立角度直接塞成 Spine sequence 来冒充可控的手部 IK；只有动作本来就是逐帧替换时才使用序列。
- 不在没有原始工程的情况下直接修改 `.skel` 二进制；先做派生可编辑工程。

