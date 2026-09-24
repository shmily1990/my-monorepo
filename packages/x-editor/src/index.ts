// @repo/x-editor —— 3D 编辑器核心的公开入口。
//
// 逐个具名再导出，不用 `export *`：这份清单就是这个包对外的契约，
// 一目了然，也方便打包器摇树。与 @repo/ui 的 barrel 同一个约定。
//
// 数据契约（EditorDataset / EditorDataLoader 等）不在这个包里 ——
// 它们在 @repo/x-typings，因为应用要按同一套契约实现自己的 loader。

export { XEditorCore } from "./core/x-editor-core";
export type { XEditorCoreProps } from "./types";
