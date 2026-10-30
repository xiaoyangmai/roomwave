# Roomwave 运行时契约

角色层对 Roomwave 暴露语义，不暴露模型专用骨骼名。这样以后换模型或重做 IK 时，按钮和房间状态不用重写。

## 语义动作

```js
{
  type: 'foam_wipe',
  target: 'face',
  intensity: 0.8,
  seed: 17,
  startedAt: 0
}
```

适配器把它编译成：

- base：继续循环 `idle`；
- hand：将 `hand_target_r` 沿轨迹移动并控制 IK mix；
- handVisual：单独返回可见手部骨骼位置，用来验证目标是否真的传递到画面中的手；目标点移动不等于可见手部已经接触。
- face：向 `face_target` 写入表情参数；
- secondary：可选的头发/手指弹簧；
- effects：返回 `foam_anchor_face`、`foam_anchor_hand` 等屏幕坐标。

## 最小接口

```ts
interface SpineCharacterAdapter {
  load(manifest): Promise<void>;
  playSemantic(action, options): void;
  setTarget(name, worldX, worldY): void;
  getAnchor(name): { x: number; y: number } | null;
  captureTrace(): object;
  resetToIdle(): void;
}
```

Roomwave 继续负责按钮、房间状态和同步；Spine 适配器负责模型和动作；泡沫、水、风扇负责各自的效果渲染。先保留现有 Canvas/Pixi 效果，等锚点稳定后再决定是否把效果也迁入 Spine。

## `gaming_c010` 房间级里程碑

`/solo/?room=gaming_c010` 是正式的 c010 Gaming 直播间。它复用原 Gaming 直播结构和交互语义，但角色、动作轨迹、目标点、泡沫锚点和调试轨迹由 c010 Spine 适配器负责。`/solo/?spine=c010` 保留为兼容入口；`/spine-audit/c010/` 仍是模型审计页，不是产品房间。

默认 `/solo/` 只显示原版 `gaming-seated` 对照画面；旧版 `gaming` 房间仍可通过 `?room=gaming` 直达，不与新房间混用。浏览器启动验证必须确认：`gaming_c010` 能冷启动、五类动作能回放、效果锚点来自语义绑定、动作可中断回 idle，且原版对照房间仍可用。

