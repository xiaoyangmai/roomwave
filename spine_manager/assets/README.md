# Spine 资产分区

- `source/`：原始拆分图和参考图，只读保存。
- `masks/`：每次局部重绘使用的遮罩，和生成记录一一对应。
- `generated/`：生图候选，不直接进入发布资源。
- `approved/`：通过自动硬门槛和独立视觉审查、已经清理透明边缘的 PNG。
- `spine-export/`：Spine 导出的 `.skel/.atlas/.png` 和 manifest。

`source/c010/` 是由 `assets:extract-c010` 从已导入的 `source/nikke_4.0.47/c010_00/c010_00.atlas` 自动拆出的 region 和 alpha mask；它带源坐标与哈希，只作为补图输入，不代表已经通过视觉审查。旧的无 `.spine` c010 拆分目录已删除。

建议文件名包含角色、部件、姿势和版本，例如：

```text
c010_hand_r_contact_v03.png
c010_hand_r_contact_v03.mask.png
c010_hand_r_contact_v03.meta.json
```

