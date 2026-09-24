"use client";

import { Button } from "@repo/ui";
import type { ReactNode } from "react";

import styles from "./editor-header.module.scss";

/**
 * 编辑器顶栏：**左侧预留 logo 位** + 标题 +（可选）保存动作。
 *
 * logo 位不内置任何品牌 —— 传进来的是 ReactNode，由调用方决定。不传时留一个等宽占位块，
 * 这样标题的位置不会因为有没有 logo 而左右跳动。
 *
 * 只用 `@repo/ui` 的 `Button`（真组件）；文字用原生标签而不是 `Typography.Text` ——
 * 后者的静态成员在跨包引用时是个已知坑（见根 AGENTS.md），这里没必要冒那个风险。
 */
export function EditorHeader({
  logo,
  title,
  onSave,
  saving,
}: {
  logo?: ReactNode;
  title: string;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        {logo ?? <span className={styles.logoPlaceholder} aria-hidden="true" />}
      </div>

      <span className={styles.title}>{title}</span>

      <div className={styles.actions}>
        {onSave ? (
          <Button size="small" loading={saving} onClick={onSave}>
            保存
          </Button>
        ) : null}
      </div>
    </header>
  );
}
