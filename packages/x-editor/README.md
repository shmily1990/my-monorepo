# `@repo/x-editor`

3D 编辑器核心。React 19 + `@react-three/fiber` + `three` + `zustand`，布局是顶栏加三列
（左 2D / 中 3D / 右列表），列间两条可拖拽分隔条。

参考原型：`docs/editor-core.jpg`。

## What's in here

| Export             | Kind      | Notes                                            |
| ------------------ | --------- | ------------------------------------------------ |
| `XEditorCore`      | component | 公开入口。`{ loader, logo?, title?, onSave? }`。 |
| `XEditorCoreProps` | type      | 它的 props 类型。                                |

数据契约（`EditorDataset`、`EditorDataLoader` 等）**不在这个包里** —— 它们在
`@repo/x-typings`。原因：**应用要按同一套契约实现自己的 loader**，两边必须看到同一个定义。

## Source, not built

与其它内部包一样：`exports` 指向 `./src/index.ts`，没有 `dist/`、没有 build 脚本、
没有 Turbo build 任务。消费方的打包器直接编译这份源码。

代价是消费方必须能编译 TS 与 SCSS（Next.js 可以，本仓库唯一的应用）。

## 接入一个应用需要两处，缺一不可

```tsx
// 1) 应用侧：必须用 dynamic + ssr:false 包一层
const XEditorCore = dynamic(
  () => import("@repo/x-editor").then((mod) => mod.XEditorCore),
  { ssr: false },
);

// 2) 应用侧：按契约实现 loader
const loader: EditorDataLoader = {
  kind: "both",
  async init() {},
  async loadDataset() {
    /* … */
  },
};

<XEditorCore loader={loader} title="标注平台" />;
```

**为什么 `ssr: false` 是必需的，而且必须留在应用侧。** 这个包内部是 r3f 的 `<Canvas>`，
它会碰 WebGL 与浏览器 API。两件事都会咬人：

1. **r3f 自己不提供 `"use client"`**（已核实：两个 tarball 里 0 处指令），所以本包里
   每个渲染 r3f 元素的模块都必须自己写。
2. **光有 `"use client"` 挡不住服务端预渲染** —— 它只划出客户端边界，服务端仍会渲染
   一遍初始 HTML，那一遍就在 WebGL 代码上踩 `document is not defined`。所以调用方还要
   `ssr: false`。

而那个 `dynamic` **不能放进本包** —— 放进来就等于让这个 3D 库依赖 Next。同
「`AntdRegistry` 留在应用、`UiProvider` 留在 `@repo/ui`」是同一条边界。

## 面板要不要显示，由 loader 同步声明

三列与两条分隔条**始终存在**，拖拽始终可用。某一列有没有内容取决于 loader 的 `kind`：

| `loader.kind` | 左列（2D）         | 中列（3D）         |
| ------------- | ------------------ | ------------------ |
| `"both"`      | 渲染内容           | 渲染场景           |
| `"2d"`        | 渲染内容           | 「无此类数据」占位 |
| `"3d"`        | 「无此类数据」占位 | 渲染场景           |

右列是**跨维度**的列表（每条 item 自带 `kind`），不参与这个判断。

这条规则只有一处落点 —— `src/layout/editor-panel.tsx`。三个列组件都不自己判断，
避免出现「左列认为自己该显示、中列也认为自己该显示」这类不一致。

`kind` 是**同步可读的属性**而不是方法：编辑器要在首屏就据此决定布局，等异步返回会让布局跳一下。

## 状态

`zustand`，**每个 `<XEditorCore>` 实例一个 store**（`createEditorStore()` + Context）。
模块级单例会让同页的两个编辑器共享状态、也污染测试。

store 里只放真正跨面板的东西 —— 目前是 `dataset`、`status` 与 `selectedItemId`。
面板宽度**不进 store**，那是 `react-resizable-panels` 自己的事。

用的时候**必须传窄选择器**：

```ts
const selected = useEditorStore((s) => s.selectedItemId); // ✓
const state = useEditorStore((s) => s); // ✗ 任何字段变化都重渲染整个组件
```

`loader` **不进 store** —— 它是调用方注入的外部依赖，走 Context（`useEditorLoader()`）。

## 样式

每个组件一个 `<name>.module.scss`（标准的 CSS Modules 命名，与应用侧一致）。

**样式值自成一体，不读应用的 `--or-*` 令牌。** 那些变量定义在
`apps/openrouter-web/styles/tokens.scss`，本包看不到也不该依赖 —— 依赖了的话，
换一个应用消费这个包就会因为拿不到变量而掉成无色。

`src/scss.d.ts` 里的 `declare module "*.module.scss"` 是本包自己声明的。那条声明在
`next/types/global.d.ts` 里，只对 Next 应用的编译环境生效；本包 extend 的是
`react-library.json`，看不到它，`.scss` 导入会报 `TS2307`。

## 3D 场景

`src/scene/`。结构照参考实现（Bosch labelwise 的 `MainLidarView.tsx`）裁剪：
一台透视相机 + 轨道控制器 + 一盏环境光 + 坐标轴 + 点云。

三个从参考实现学来的约定，都不是随便定的：

- **z-up 世界**（`up={[0,0,1]}`）。参考实现如此，因为它的正交相机只绕 z 旋转；
  而 z 轴朝上也是该领域（激光雷达 / 自动驾驶标注）的通行约定。
- **只有一盏 `<ambientLight>`**。点云用顶点色材质、不参与光照计算，加更多灯只是白烧着色。
- **`frameloop="always"`**。参考实现只给主视图用 `"always"`、副视图用 `"demand"`，
  因为 `demand` 会让拖拽跳帧。这里只有一个视图，所以取 `"always"`。

点云的 `BufferGeometry` **在卸载时会 `dispose()`** —— 几何体持有 GPU 缓冲、不受 GC 管理，
不释放就是显存泄漏。这是 3D 代码里最常漏的一处。

**同心圆（距离环）** 在 `scene/concentric-circles.tsx`，给出场景的尺度参照：

```tsx
<ConcentricCircles radiuses={[30, 50, 80, 100]} />
```

- 圆落在 **XY 平面、z = 0** —— z-up 世界里的地面，所以从斜上方看它们是**椭圆**而不是正圆。
- 用 `<lineLoop>` + 显式 `BufferGeometry`，与点云同一套做法（建几何体 + 卸载时 `dispose()`）。
  没用 drei 的 `<Line>`：那个给的是屏幕空间恒定宽度的粗线，而这些环在原型里是细而淡的。
- `radiuses` 这个拼写是照参考实现的调用点来的（语法上 `radii` 更好，但与既有调用点一致更重要）。
- ⚠️ **画线不要用 `<line>`。** R3F 把 three 的导出名首字母小写变成 JSX 元素，但
  `line` 与 `path` 因为和 SVG 标签撞名被改名成 `threeLine` / `threePath`（`audio` / `source` 则被整个去掉）。
  写 `<line>` 拿到的是 SVG 的 line。`lineLoop` 不在改名名单里，不受影响。

## 帧率读数（中列左上角）

由 **drei 的 `<Stats>`** 提供（参考实现用的也是它），`showPanel={0}` 即 FPS 面板。
`XEditorCoreProps.showFps` 默认 `true`，传 `false` 关掉。

**先说清格式差异**：stats.js 画的是 `round(fps) + ' FPS (' + round(min) + '-' + round(max) + ')'`，
也就是 **`60 FPS (58-61)`** —— 一个 min–max 区间。设计原型里那个 `60 FPS (26.60)`
（单个两位小数）**不是**它能产出的格式；而且它一次只能显示一个面板（0=FPS / 1=MS / 2=MB），
原型那种「FPS 加括号里一个 ms」的组合它给不了。要逐字还原只能手写计数器。

四个实现细节，都不是随手写的：

1. **`<Stats>` 必须在 `<Canvas>` 内部。** 它用的是 R3F 的 `addEffect` / `addAfterEffect`，
   那两个绑定在 R3F 的 store 上。它自身 `return null` —— 真正的工作是把 stats.js 的
   DOM 面板 append 进 `parent` 指向的元素。
2. **等 ref 挂上再渲染，但不能照抄参考实现的写法。** 参考实现写的是
   `{containerRef.current && <Stats parent={containerRef} />}`；那在它那里能用，是因为
   它那个组件有大量 state、挂载后必然重渲染一次让条件翻真。`EditorCanvas` 几乎没有 state，
   条件永远不翻真，`<Stats>` 就永不渲染。更隐蔽的是 drei 那个 effect 的依赖是
   `[parent, stats, className, showPanel]`，`parent` 是**稳定的 ref 对象**，所以
   `.current` 从空变成有值**不会**让 effect 重跑 —— 无条件渲染的话 `stats.dom` 会被
   append 到 `document.body`（stats.js 在 parent 为空时的兜底）并永远留在那儿。
   这里用 **ref 回调 + 一次 setState** 解决，顺带避开了 `react-hooks`
   `recommended-latest` 里"effect 内同步 setState"那条 error。
3. **每一项覆盖都必须 `!important`。** stats.js 把容器样式写成**内联** `cssText`
   （`position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000`），
   类名在层叠上赢不过内联样式。不覆盖 `position` 的话读数会相对**视口**定位，
   跑到整个页面左上角去。
4. **要放开 `pointer-events`。** stats.js 的容器是 80×48 的**可点击**块（点它循环切换面板），
   不放开就会吃掉面板左上角那一片的轨道拖拽。切换面板由 `showPanel` prop 决定，不靠点击。

依赖上不需要任何改动：`stats.js@0.17.0` 是 **drei 的 dependencies**，已随它装好。
但**不能直接 `import Stats from "stats.js"`** —— 它没有软链到本包的 `node_modules`，
也没在本包里声明，`import/no-extraneous-dependencies` 会拦。只从 `@react-three/drei` 引。

## Version constraints

- **`three` 不自带类型。** `@types/three` 必须一起装，且与 `three` 保持同一 minor。
- **`@react-three/fiber@9` 的 peer 是 `react >=19 <19.4`。** React 升过 19.3 会直接破坏它，
  而 v10 alpha 的上限更窄（`<19.3`），不能靠它躲。动 React 版本前先看这个 peer。
- **`react-resizable-panels` 是 v4（breaking 大版本）。** `Group` / `Separator` / `orientation`，
  **不是**网上多数示例里的 `PanelGroup` / `PanelResizeHandle` / `direction`。
  尺寸语义：数字当像素、不带单位的字符串当百分比 —— 所以这里一律写 `"25%"` 这种带单位的字符串。
- **r3f 元素是小写的**（`<points>`、`<ambientLight>`），JSX 把它们当 DOM 元素，
  于是 `react/no-unknown-property` 会拿 HTML 属性表去校验 three.js 的属性。
  用到的名字要加进 `packages/eslint-config/react.js` 的 ignore 列表 —— 那条规则只会多报、
  不会静默放过，所以漏一项就是一次明确的报错。

## Not in this round

- 2D 视图是占位（只列出帧名，不渲染图像）。参考实现里那是一个 156 KB 的 konva 画布。
- 右侧列表是占位（列出条目、可选中、中列有反馈），没有真实的对象模型。
- 底部帧回放条**不做** —— 参考图里有，但本次明确省略。
