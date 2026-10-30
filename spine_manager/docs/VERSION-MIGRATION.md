# c010 Spine 版本迁移

当前正式目标基线是 **Spine 4.3.26**，Roomwave 浏览器运行库是 **`@esotericsoftware/spine-canvas@4.3.13`**。4.0.47 只保留为只读源和回滚基线，不覆盖、不改写。

迁移副本位于：

```text
source/nikke_4.3.26/derived/c010_roomwave_4.3.26/
```

已完成的证据链：

1. 用项目内 `tools/spine-4.3.26/SpinePortable.exe` 打开迁移副本。
2. 在 4.3.26 编辑器中保存，目标工程哈希与 4.0.47 输入不同，且源工程保持不变。
3. 从 4.3.26 工程导出 JSON、atlas 和四张纹理页，导出骨架版本为 4.3.26。
4. 用 4.3.13 runtime 回载导出物：310 根骨骼、141 个插槽、3 个皮肤、10 个动画、4 个图集页、274 个图集区域均能解析，并在浏览器中实际渲染 `00/idle`。
5. Roomwave 的 c010 审计页、兼容入口和 `gaming_c010` 产品房间已切到这套 JSON + atlas + 4.3.13 runtime。

迁移证据：

- `evidence/c010-migration-4.3.26-save.json`
- `evidence/c010-migration-4.3.26-export.json`
- `evidence/c010-migration-runtime-staged.json`
- `spine-audit/c010/migration-4.3.html`（浏览器回读与渲染探针）

当前状态是 `exported-4.3.26-runtime-round-trip-pass`。这证明版本迁移和运行时回读已成立，但不代表手部 IK、背带隔离、动作自然度和四道视觉门已经发布通过；这些仍按既定闭环重新跑证据。

回滚指针固定为：

```text
编辑器：4.0.47
工程：source/nikke_4.0.47/derived/c010_roomwave_4.0.47/c010_roomwave_4.0.47.spine
运行库：@esotericsoftware/spine-canvas@4.0.31
导出物：../src/spine-audit/c010/model/
```

以后任何模型改动都先在 4.3.26 派生工程中完成，再导出到 `../src/spine-audit/c010/model-4.3.26/`，随后重新做结构、动作、纹理、视觉、冷启动和回滚检查。4.0.47 轨只用于对照和故障回退。
