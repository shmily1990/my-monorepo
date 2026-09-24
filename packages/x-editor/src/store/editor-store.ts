import type { EditorDataset } from "@repo/x-typings";
import { createStore } from "zustand";
import type { StoreApi } from "zustand";

/**
 * 编辑器状态。
 *
 * **每个 `<XEditorCore>` 实例一个 store**，用 `createEditorStore()` 在组件里创建，
 * 通过 Context 往下传（见 `core/editor-context.tsx`）。
 *
 * 为什么不用模块级单例：同一页挂两个编辑器时它们会共享状态；测试之间也会互相污染。
 * 参考实现（Bosch labelwise 的 x-editor）用的是模块级单例，那是它的一个已知代价。
 *
 * 这个文件**不 import React** —— 纯粹的 vanilla store，React 绑定在 context 那个文件里。
 */
export type EditorStatus = "idle" | "loading" | "ready" | "error";

export type EditorState = {
  status: EditorStatus;
  /** status 为 "error" 时的原因 */
  error?: string;
  dataset: EditorDataset | null;
  /**
   * 右列被选中的行。
   *
   * 这是本次唯一真正的**跨面板状态**：右列点击写入，中列 3D 场景读出并高亮。
   * 面板宽度不进 store —— 那是 `react-resizable-panels` 自己的事。
   */
  selectedItemId: string | null;
  setStatus: (status: EditorStatus, error?: string) => void;
  setDataset: (dataset: EditorDataset) => void;
  selectItem: (id: string | null) => void;
};

export function createEditorStore(): StoreApi<EditorState> {
  return createStore<EditorState>()((set) => ({
    status: "idle",
    dataset: null,
    selectedItemId: null,

    setStatus: (status, error) => set({ status, error }),
    // 拿到数据即视为就绪，少一次状态设置、也少一处可能忘记同步的地方
    setDataset: (dataset) => set({ dataset, status: "ready" }),
    selectItem: (selectedItemId) => set({ selectedItemId }),
  }));
}
