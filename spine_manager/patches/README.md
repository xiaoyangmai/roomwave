# Rigby2D 本地修补

基准提交：`f0ff6918902c10f0d18262d1b97a12b5fd8df7ec`。

`rigby2d-terminal-key-curve.patch` 只修复 MCP 回读比较：关键帧曲线描述它到下一帧的插值，末帧没有下一段。JSON 按格式省略末帧曲线，验证器不应因此报告数据丢失。实际发现的差异只有旧泡沫候选三条骨骼时间线的末帧曲线；骨骼、帧值、时刻和有效区间曲线不变。

新检出 Rigby2D 后，在 Roomwave 根目录应用并验证：

```powershell
git -C rigby2d apply --check ../spine_manager/patches/rigby2d-terminal-key-curve.patch
git -C rigby2d apply ../spine_manager/patches/rigby2d-terminal-key-curve.patch
node --test spine_manager/tests/rigby-roundtrip.test.mjs
```

若补丁已应用，`git -C rigby2d apply --reverse --check ../spine_manager/patches/rigby2d-terminal-key-curve.patch` 可以确认，无需再次应用。

测试读取真实 c010 输入，在独立派生副本构造带末帧缓动的回归动画，通过 Rigby JSON 写出/解析回读逐时刻比较插值，并确认原始输入字节不变。测试动作只用于格式回归，不能作为擦脸动作验收。
