"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import styles from "./index.module.scss";
import { AccptanceDataLoader } from "./taskLoader";

/*
 * ⚠️ 这里必须用 `next/dynamic({ ssr: false })`。
 *
 * `@repo/x-editor` 内部是 react-three-fiber 的 `<Canvas>`，会碰 WebGL 与浏览器 API。
 * 而 **`"use client"` 挡不住服务端预渲染** —— 它只划出客户端边界，服务端仍会渲染一遍
 * 初始 HTML，那一遍就会在 WebGL 相关代码上踩 `document is not defined`。
 * （R3F 自己也不带 `"use client"`，这点已核实过。）
 *
 * 这个 dynamic **必须留在应用侧，不能放进 `@repo/x-editor`** —— 放进去就等于让那个 3D 库
 * 依赖 Next。与「`AntdRegistry` 留在应用、`UiProvider` 留在 `@repo/ui`」是同一条边界。
 *
 * 页面本身不出现滚动条：高度算法与注意事项见 index.module.scss。
 */
const XEditorCore = dynamic(
  () => import("@repo/x-editor").then((mod) => mod.XEditorCore),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>编辑器加载中…</p>,
  },
);

export function EditorPage() {
  // loader 只建一次；传进编辑器后由它调 init() 与 loadDataset()
  const loader = useMemo(() => new AccptanceDataLoader("openrouter"), []);

  return (
    <main className={styles.editor}>
      {/*
        logo 位是 props 传的，编辑器本身不内置任何品牌元素。
        这里先留空 —— 传进来就会替换掉那个虚线占位框，例如：
          logo={<OpenRouterLogo size={22} />}
        注意编辑器的顶栏是深色的，浅色/深色文字标的可见性要自己确认。
      */}
      <XEditorCore loader={loader} title="数字孪生" />
    </main>
  );
}
