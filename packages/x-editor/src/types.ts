import type { EditorDataLoader } from "@repo/x-typings";
import type { ReactNode } from "react";

/**
 * `XEditorCore` 的 props。
 *
 * 组件 props 属于 UI 关注点，按 `add-shared-type` skill 的判据**留在组件旁边**，
 * 不进 `@repo/x-typings` —— 那里只放跨包的数据契约（见 `x-typings/src/editor.ts`）。
 */
export type XEditorCoreProps = {
  /**
   * 数据加载器。编辑器不关心它从哪来、也不持有它：
   * 只按它**同步声明**的 `kind` 决定左中两列渲染内容还是占位，再调 `loadDataset()` 取数。
   */
  loader: EditorDataLoader;

  /** 顶栏左侧预留的 logo 位。传什么由调用方决定 —— 编辑器不内置任何品牌元素。 */
  logo?: ReactNode;

  /** 顶栏标题。 */
  title?: string;

  /**
   * 是否在 3D 面板左上角显示帧率读数。默认 `true`（与设计原型一致）。
   *
   * 由 drei 的 `<Stats>` 提供，也就是 stats.js 的面板 —— 显示格式是
   * `60 FPS (58-61)`（min–max 区间），与原型里那个 `60 FPS (26.60)`（单个小数）不同，
   * 且一次只能显示一个面板（FPS / MS / MB）。详见 README。
   */
  showFps?: boolean;

  /** 提供时，顶栏会出现保存动作，点击会调 `loader.save(dataset)`。 */
  onSave?: (loader: EditorDataLoader) => void | Promise<void>;
};
