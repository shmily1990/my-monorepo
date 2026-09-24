"use client";

import styles from "./viewer-2d.module.scss";

/**
 * 左列：2D 视图。
 *
 * **本轮是占位** —— 只把 dataset 里的 2D 帧列出来，不渲染真实图像。
 * 参考实现里这一列是一个 156 KB 的 konva 画布（`CameraView.tsx`），
 * 那属于下一轮的工作。
 *
 * 它不自己判断"该不该显示" —— 那是 `EditorPanel` 按 loader 的 `kind` 做的，
 * 走到这里就说明有 2D 数据。
 */
export function Viewer2D() {
  return (
    <div className={styles.wrap}>
      <p className={styles.note}>2D 渲染将在后续接入（本轮为占位）</p>
    </div>
  );
}
