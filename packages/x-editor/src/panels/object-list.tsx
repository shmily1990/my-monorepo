"use client";

import { useEditorStore } from "../core/editor-context";
import styles from "./object-list.module.scss";

/**
 * 右列：列表。
 *
 * 这一列**跨维度** —— 它列的是 `dataset.items`，每条 item 自带 `kind` 说明自己来自
 * 2D 还是 3D，所以它不参与"该不该显示"的能力判断（`EditorPanel` 不传 dimension 即此意）。
 *
 * 点击一行会写入 `selectedItemId`，中列 3D 场景读它做高亮 ——
 * 这是本次唯一真正的跨面板状态，也是 store 存在的理由。
 *
 * 用 `<button>` 而不是 `<li onClick>`：可聚焦、可用键盘触发，读屏也能正确播报。
 */
export function ObjectList() {
  const items = useEditorStore((state) => state.dataset?.items);
  const selectedItemId = useEditorStore((state) => state.selectedItemId);
  const selectItem = useEditorStore((state) => state.selectItem);

  if (!items || items.length === 0) {
    return <p className={styles.note}>没有列表数据</p>;
  }

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isSelected = item.id === selectedItemId;

        return (
          <li key={item.id}>
            <button
              type="button"
              className={styles.row}
              data-active={isSelected}
              aria-pressed={isSelected}
              onClick={() => selectItem(isSelected ? null : item.id)}
            >
              <span className={styles.label}>{item.label}</span>
              <span className={styles.kind}>{item.kind.toUpperCase()}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
