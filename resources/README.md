# 运行资源

这里集中 Roomwave 和人物运行时实际加载的资源，入口是 [index.json](./index.json)。

| 目录 | 内容 | 浏览器 URL |
|---|---|---|
| `assets/` | 房间、人物精灵、界面图片 | `/assets/` |
| `audio/` | 音乐和声音 | `/audio/` |
| `characters/` | 可加载角色包、模型、纹理、绑定 | `/character-packs/` |
| `config/` | 角色注册表和当前运行配置 | `/config/` |

`index.json` 记录模块资源目录、公开路径、[角色注册表](./config/character-registry.json)和[原公开资源来源清单](./mirror-report.json)。Roomwave 服务公开索引于 `/resources/index.json`。

生产输入在 `spine_manager/source/`，生产批次在 `spine_manager/artifacts/`，检查证据在 `spine_manager/evidence/`。这些目录不作为公开资源根目录。候选经过生产检查后再接入这里；源文件不由产品运行时修改。

当前 c010 包和注册表版本均为 `0.3.0`，仍是发布前候选。`foam_wipe` 已包含在实际 skeleton 中，AIRI 与产品 Canvas 播放同一份 3.6 秒导出动画；擦脸锚点与完整动作已验收，水和风仍沿用原配方。源工程、导出及验收记录见 `spine_manager/artifacts/runs/c010-foam-wipe-20261104/`。来源许可和其他未确认锚点仍单独阻断发布，详见 [来源说明](../SOURCE-NOTICE.md)。

资源目录中的版本号不代表可以删除旧版：Baking v1–v4、Workout v1–v3 和 Gaming Seated v2/v3 各自仍有代码引用或动态加载用途。
