"use client";

import { Input } from "@repo/ui";

import { SearchIcon } from "@/components/icons";

import type { ApiKey } from "../../api-key";
import { KeyTable } from "../key-table";
import styles from "./index.module.scss";

/**
 * 包住表格的那张卡片：搜索框 + 表格 + 底部计数。
 *
 * 三样东西放在一个带边框的容器里是有意的 —— 参考图里它们共用同一条外框线，
 * 搜索框下方那条线就是表头区域的起点。分成三个独立卡片会丢掉这个结构。
 */
export function KeyListCard({
  keys,
  totalCount,
  selected,
  onToggle,
  onToggleAll,
  search,
  onSearchChange,
}: {
  keys: readonly ApiKey[];
  totalCount: number;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  /*
   * 底部那行文字。参考图是 "1 key"（总数）；有勾选时改成勾选数更有用。
   * 用 totalCount 而不是 keys.length —— 搜索过滤后 keys 只是子集，
   * 而"总共有几个 key"是这一行要回答的问题。
   */
  const footerLabel =
    selected.size > 0
      ? `已选 ${selected.size} / ${totalCount}`
      : `${totalCount} ${totalCount === 1 ? "key" : "keys"}`;

  return (
    <section className={styles.card}>
      <div className={styles.searchRow}>
        <Input
          className={styles.search}
          size="large"
          prefix={<SearchIcon size={16} />}
          placeholder="Search by name or paste a key..."
          aria-label="搜索 API key"
          allowClear
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <KeyTable
        keys={keys}
        selected={selected}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
      />

      <div className={styles.footer}>{footerLabel}</div>
    </section>
  );
}
