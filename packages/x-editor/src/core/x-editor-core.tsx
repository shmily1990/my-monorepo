"use client";

import { useCallback, useEffect, useState } from "react";

import { EditorShell } from "../layout/editor-shell";
import { createEditorStore } from "../store/editor-store";
import type { XEditorCoreProps } from "../types";
import { EditorContextProvider, EditorStoreProvider } from "./editor-context";

/**
 * 3D 编辑器核心，`@repo/x-editor` 的公开入口。
 *
 * 职责就三件：建一个属于本实例的 store、把 loader 从 props 转成 Context、
 * 调一次 `loader` 把数据灌进 store。布局在 `layout/`，3D 在 `scene/`。
 *
 * **本文件必须 `"use client"`** —— 它下面挂着 react-three-fiber 的 `<Canvas>`，
 * 而 R3F 自己不带这个指令（已核实：两个 tarball 里 0 处 `"use client"`）。
 *
 * 但**光有它不够**：`"use client"` 只是划出客户端边界，不阻止服务端预渲染，
 * 而 WebGL 相关的代码在服务端会踩 `document is not defined`。所以**调用方还要用
 * `next/dynamic({ ssr: false })` 包一层** —— 那件事留在应用侧做，不放进这个包，
 * 否则这个 3D 库就要依赖 Next 了（同 `AntdRegistry` 留在应用、`UiProvider` 留在 @repo/ui）。
 */
export function XEditorCore({
  loader,
  logo,
  title = "Editor",
  showFps = true,
  onSave,
}: XEditorCoreProps) {
  /*
   * store 只建一次。用 useState 的惰性初始化而不是 useRef：
   * 这是 zustand 官方推荐的写法，StrictMode 下双渲染也会拿到同一个实例。
   */
  const [store] = useState(createEditorStore);
  const [saving, setSaving] = useState(false);

  /*
   * 装载数据。用 `store.getState()` 而不是 hook —— 这里只需要"写"，
   * 订阅反而会让整个编辑器组件跟着任何一次状态变化重渲染。
   *
   * `cancelled` 是必需的：loader 是异步的，组件可能在它返回前就卸载了
   * （比如用户切走 /editor 页），那时再 setState 就是往一个已经没人看的 store 里写。
   */
  useEffect(() => {
    let cancelled = false;

    store.getState().setStatus("loading");

    loader
      .init()
      .then(() => loader.loadDataset())
      .then((dataset) => {
        if (!cancelled) store.getState().setDataset(dataset);
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        store
          .getState()
          .setStatus(
            "error",
            error instanceof Error ? error.message : String(error),
          );
      });

    return () => {
      cancelled = true;
    };
  }, [loader, store]);

  const handleSave = useCallback(() => {
    if (!onSave) return;

    setSaving(true);
    // Promise.resolve 是为了同时接住 void 与 Promise<void> 两种返回
    void Promise.resolve(onSave(loader)).finally(() => {
      setSaving(false);
    });
  }, [loader, onSave]);

  return (
    <EditorStoreProvider value={store}>
      <EditorContextProvider value={loader}>
        <EditorShell
          logo={logo}
          title={title}
          showFps={showFps}
          onSave={onSave ? handleSave : undefined}
          saving={saving}
        />
      </EditorContextProvider>
    </EditorStoreProvider>
  );
}
