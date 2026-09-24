import { z } from "zod";

/**
 * 3D 编辑器（`@repo/x-editor`）的数据契约。
 *
 * 放这里而不是放 x-editor 里，是因为**应用要按这套契约实现自己的 loader**
 * （`apps/openrouter-web/features/editor/taskLoader.ts`），两边必须看到同一个定义。
 * 依赖方向没有因此改变：仍然是 app → x-typings、x-editor → x-typings，
 * 没有任何箭头指向 app。
 */

/** 数据源有哪些维度。编辑器据此决定左（2D）中（3D）两列渲染内容还是占位。 */
export const EditorDataKindSchema = z.enum(["2d", "3d", "both"]);
export type EditorDataKind = z.infer<typeof EditorDataKindSchema>;

/** 点云里的一个点。真实实现里会是解析后的点（含强度/时间戳等），本轮只有坐标。 */
export const EditorPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});
export type EditorPoint = z.infer<typeof EditorPointSchema>;

/** 2D 视图的一帧。 */
export const EditorFrame2DSchema = z.object({
  id: z.string(),
  label: z.string(),
  imageUrl: z.string(),
});
export type EditorFrame2D = z.infer<typeof EditorFrame2DSchema>;

/** 右侧列表里的一行。`kind` 说明它来自哪个维度。 */
export const EditorListItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["2d", "3d"]),
});
export type EditorListItem = z.infer<typeof EditorListItemSchema>;

/** 一次装载出来的全部数据。 */
export const EditorDatasetSchema = z.object({
  kind: EditorDataKindSchema,
  points: z.array(EditorPointSchema),
  frames2d: z.array(EditorFrame2DSchema),
  items: z.array(EditorListItemSchema),
});
export type EditorDataset = z.infer<typeof EditorDatasetSchema>;

/**
 * 编辑器需要的数据加载器契约：**应用实现、编辑器消费**。
 *
 * ⚠️ 这是本仓库「共享类型一律是 Zod schema，TS 类型由 `z.infer` 推导」这条规则的
 * **一处有意例外**，已记在 `docs/conventions.md` 第 7 节的「已知例外」里。
 *
 * 理由：它是个**带方法的接口**，而 Zod 只能描述数据、描述不了方法。那条规则的用意是
 * 防止「schema 与手写类型两份、迟早漂移」——而方法接口没有对应的运行时形态，
 * 不存在会漂移的第二份。所以这里用纯 TS interface 是恰当的，不是偷懒。
 *
 * 编辑器内部是**用 React Context 而不是 zustand store** 来传递 loader 的：
 * loader 是外部注入的依赖，不是编辑器自己的状态。参考实现的 store 文件虽然全是空的，
 * 但从它的调用点能确认它也是这个做法。
 */
export interface EditorDataLoader {
  /** 声明本数据源有哪些维度。**同步可读** —— 编辑器要在首屏就据此决定布局。 */
  readonly kind: EditorDataKind;
  init(): Promise<void>;
  loadDataset(): Promise<EditorDataset>;
  /** 可选：应用传了 `onSave` 时才有意义。 */
  save?(dataset: EditorDataset): Promise<void>;
}
