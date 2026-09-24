"use client";

import { Empty } from "@repo/ui";
import type { ReactNode } from "react";

import { useEditorLoader, useEditorStore } from "../core/editor-context";
import styles from "./editor-panel.module.scss";

/**
 * 面板外壳：标题栏 + 内容区，**并且是「能力判断」唯一的落点**。
 *
 * 三列的布局与两条分隔条**始终存在**，可拖拽始终可用；某一列有没有内容，由 loader
 * 同步声明的 `kind` 决定：
 *   - `kind === "both"` → 两列都渲染内容
 *   - `kind === "2d"`   → 中列（3D）渲染"无此类数据"占位
 *   - `kind === "3d"`   → 左列（2D）渲染占位
 *
 * 把这条规则放在这里而不是散到三个列组件里，是为了只有一处需要改 ——
 * 也避免出现"左列认为自己该显示、中列也认为自己该显示"这类不一致。
 *
 * 加载中 / 加载失败的状态也在这里统一渲染，三个面板表现一致。
 */
export function EditorPanel({
  title,
  dimension,
  children,
}: {
  title: string;
  /** 这个面板服务的维度。**不传表示与维度无关**（例如右列是跨维度的列表）。 */
  dimension?: "2d" | "3d";
  children: ReactNode;
}) {
  const { kind } = useEditorLoader();
  const status = useEditorStore((state) => state.status);
  const error = useEditorStore((state) => state.error);

  const available =
    dimension === undefined || kind === "both" || kind === dimension;
  const dimensionLabel = dimension === "2d" ? "2D" : "3D";

  return (
    <section className={styles.panel}>
      <header className={styles.head}>{title}</header>

      <div className={styles.body}>
        {status === "error" ? (
          <Empty
            className={styles.placeholder}
            description={`数据加载失败：${error ?? "未知原因"}`}
          />
        ) : status === "ready" ? (
          available ? (
            children
          ) : (
            <Empty
              className={styles.placeholder}
              description={`当前数据源没有 ${dimensionLabel} 数据`}
            />
          )
        ) : (
          <Empty className={styles.placeholder} description="加载中…" />
        )}
      </div>
    </section>
  );
}
