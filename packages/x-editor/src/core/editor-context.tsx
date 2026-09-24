"use client";

import type { EditorDataLoader } from "@repo/x-typings";
import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";

import type { EditorState } from "../store/editor-store";

/**
 * 编辑器向下暴露的两样东西。
 *
 * **loader 走 Context、不进 store**：它是调用方注入的外部依赖，不是编辑器自己的状态。
 * 把它塞进 store 会让「刷新数据」和「改状态」混在一起，也没法在 store 之外读它。
 * 参考实现的 store 文件虽然全是空的，但从它的调用点（六处 `const loader = useLoader()`，
 * 且 `MainLidarView` 只收到 `frame` 一个 prop）能确认它也是这么分的。
 */

const EditorLoaderContext = createContext<EditorDataLoader | null>(null);
const EditorStoreContext = createContext<StoreApi<EditorState> | null>(null);

export const EditorContextProvider = EditorLoaderContext.Provider;
export const EditorStoreProvider = EditorStoreContext.Provider;

export function useEditorLoader(): EditorDataLoader {
  const loader = useContext(EditorLoaderContext);

  if (!loader) {
    throw new Error(
      "useEditorLoader 必须在 <XEditorCore> 内部使用 —— loader 由它通过 Context 提供。",
    );
  }

  return loader;
}

/**
 * 按选择器订阅 store。
 *
 * **必须传窄选择器**：`useEditorStore((s) => s.selectedItemId)` 而不是整体取。
 * 整体取 store 会让任何一个字段变化都重渲染整个组件 —— 参考实现里那句注释
 * 「不建议直接使用 useSettingStore() 这样会引起整个组件重新 render」说的就是这件事。
 */
export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);

  if (!store) {
    throw new Error(
      "useEditorStore 必须在 <XEditorCore> 内部使用 —— store 由它创建并通过 Context 提供。",
    );
  }

  return useStore(store, selector);
}
