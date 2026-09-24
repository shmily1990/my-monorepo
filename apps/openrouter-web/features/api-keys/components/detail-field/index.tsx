import type { ReactNode } from "react";

import styles from "./index.module.scss";

/**
 * 详情页里的一行设置项：左边是标题 + 说明，右边是控件。
 *
 * 四行（Name / Expiration / Credit limit / Reset limit）共用同一套排布，所以抽成一个组件 ——
 * 排版规则只有一处，之后加第五行不用再抄一遍。
 *
 * 分隔线由父级卡片的 `.card > * + *` 给，不在这里加 —— 这样最后一行不会多出一条底线。
 */
export function DetailField({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.text}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.control}>{children}</div>
    </div>
  );
}
