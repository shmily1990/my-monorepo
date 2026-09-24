"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { ChevronDownIcon } from "@/components/icons";

import styles from "./index.module.scss";

/**
 * 侧栏里的一行可折叠筛选分组。
 *
 * 手写而不是用 antd 的 Collapse：这里要的就是「一行标题 + 一个箭头 + 展开的选项列表」，
 * 而且需要精确控制行高与图标位置。用 antd 的折叠面板反而要为对齐去覆盖它的一堆内部样式。
 * 它也不算表单控件，所以不走 @repo/ui。
 *
 * 展开状态放在组件内部（每个分组各管各的），只有「勾选了哪些选项」才提升到
 * features/models/index.tsx —— 那是需要跨组件共享的状态。
 */
export function FilterSection({
  icon,
  label,
  defaultOpen = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
        <ChevronDownIcon size={16} className={styles.chevron} />
      </button>

      {open ? <div className={styles.panel}>{children}</div> : null}
    </div>
  );
}
