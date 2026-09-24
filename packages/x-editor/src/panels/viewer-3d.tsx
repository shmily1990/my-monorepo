"use client";

import { useEditorStore } from "../core/editor-context";
import { EditorCanvas } from "../scene/editor-canvas";
import styles from "./viewer-3d.module.scss";

/**
 * 中列：3D 场景。
 *
 * 这一层只做一件事 —— 把 store 里的点云交给 `<EditorCanvas>`。
 * 它不碰 WebGL，所以既能被 `EditorPanel` 的服务端/客户端判断包住，
 * 也方便调用方将来换成自己的渲染器。
 *
 * **注意这里没有 `next/dynamic`。** 这个包不能依赖 Next —— 需要 `ssr: false` 的那一层
 * 由应用侧提供（见 `core/x-editor-core.tsx` 的说明）。这里只负责 `"use client"`。
 */
export function Viewer3D({ showFps }: { showFps?: boolean }) {
  const points = useEditorStore((state) => state.dataset?.points);

  if (!points || points.length === 0) {
    return <p className={styles.note}>点云为空</p>;
  }

  return <EditorCanvas showFps={showFps} />;
}
