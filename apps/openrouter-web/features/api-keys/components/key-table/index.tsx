"use client";

import { Checkbox } from "@repo/ui";
import Link from "next/link";

import { formatCreditUsage, formatDateTime } from "@/lib/utils/format";

import type { ApiKey } from "../../api-key";
import { limitKindLabel } from "../../data/mock-api-keys";
import { KeyRowActions } from "../key-row-actions";
import styles from "./index.module.scss";

/**
 * API key 表格。
 *
 * 手写 `<table>` 而不是用 @repo/ui 的 antd `Table` —— 与 models 页的表格同一个理由：
 * 这里没有排序、没有分页、没有虚拟滚动，antd Table 会带进来一整套配套的样式与行为，
 * 然后为了贴合参考图再逐条覆盖它。原生 table 的读写语义是完整的（表头/单元格关联、
 * 行的勾选状态），而布局用 CSS 网格控制更直接。
 *
 * 勾选状态由页面持有（`selected` / `onToggle` / `onToggleAll`）—— 页面底部的计数要用它。
 */
export function KeyTable({
  keys,
  selected,
  onToggle,
  onToggleAll,
}: {
  keys: readonly ApiKey[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected =
    keys.length > 0 && keys.every((key) => selected.has(key.id));
  const partiallySelected =
    !allSelected && keys.some((key) => selected.has(key.id));

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.selectCell}>
              <Checkbox
                checked={allSelected}
                indeterminate={partiallySelected}
                onChange={onToggleAll}
                aria-label="全选"
              />
            </th>
            <th scope="col">Key</th>
            <th scope="col">Guardrails</th>
            <th scope="col">Expires</th>
            <th scope="col">Last Used</th>
            <th scope="col" className={styles.numeric}>
              Key usage
            </th>
            <th scope="col" className={styles.numeric}>
              Key limit
            </th>
            <th className={styles.selectCell}>
              <span className={styles.srOnly}>操作</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {keys.map((key) => (
            <tr key={key.id}>
              <td className={styles.selectCell}>
                <Checkbox
                  checked={selected.has(key.id)}
                  onChange={() => onToggle(key.id)}
                  aria-label={`选择 ${key.name}`}
                />
              </td>

              <td>
                <Link
                  href={`/workspaces/api-keys/${key.id}`}
                  className={styles.keyLink}
                >
                  <span className={styles.keyName}>{key.name}</span>
                  <span className={styles.keyValue}>{key.maskedKey}</span>
                </Link>
              </td>

              <td className={styles.muted}>
                {key.guardrails.length === 0
                  ? "No guardrails"
                  : key.guardrails.join(", ")}
              </td>

              <td className={styles.muted}>{formatDateTime(key.expiresAt)}</td>

              <td className={styles.muted}>
                {key.lastUsedAt ? formatDateTime(key.lastUsedAt) : "Never"}
              </td>

              <td className={`${styles.numeric} ${styles.muted}`}>
                {formatCreditUsage(key.usageUsd)}
              </td>

              <td className={styles.numeric}>
                {key.limitUsd === null ? (
                  <span className={styles.muted}>—</span>
                ) : (
                  <span className={styles.limit}>
                    {/* 额度是整美元，参考图里显示成 $100 而不是 $100.00 */}
                    {`$${key.limitUsd}`}
                    <span className={styles.limitKind}>
                      {limitKindLabel(key.limitReset)}
                    </span>
                  </span>
                )}
              </td>

              <td className={styles.selectCell}>
                <KeyRowActions keyId={key.id} keyName={key.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
