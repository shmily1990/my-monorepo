"use client";

import { Button, Input, Segmented, Select } from "@repo/ui";

import {
  LayersIcon,
  ListIcon,
  SearchIcon,
  SortIcon,
  StarIcon,
  TableIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

import { PROVIDER_FILTER_OPTIONS, SORT_OPTIONS } from "../../data/filters";
import type { SortKey } from "../../data/filters";
import styles from "./index.module.scss";

/** 主列的两种呈现方式。定义在这里而不是 index.tsx，避免组件与父级互相 import。 */
export type ViewMode = "list" | "table";

/**
 * 模型列表上方的工具栏：搜索、排序、provider 过滤、Pinned 开关、列表/表格切换。
 *
 * 除了 Pinned 开关之外全是 @repo/ui 的表单控件（Input / Select / Segmented），
 * 视觉壳（尺寸、间距、圆角）由本模块的类名覆盖 —— antd 的样式规则包在 :where() 里，
 * 单类名就能盖住，不需要跟它的内部类名较劲。
 */
export function ModelsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  provider,
  onProviderChange,
  pinnedOnly,
  onPinnedChange,
  view,
  onViewChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  provider: string;
  onProviderChange: (value: string) => void;
  pinnedOnly: boolean;
  onPinnedChange: (value: boolean) => void;
  view: ViewMode;
  onViewChange: (value: ViewMode) => void;
}) {
  return (
    <div className={styles.toolbar}>
      <Input
        className={styles.search}
        size="large"
        prefix={<SearchIcon size={16} />}
        placeholder="Search models..."
        aria-label="搜索模型"
        allowClear
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Select
        className={styles.select}
        size="large"
        value={sort}
        onChange={(value) => onSortChange(value as SortKey)}
        options={[...SORT_OPTIONS]}
        suffixIcon={<SortIcon size={16} />}
        aria-label="排序方式"
      />

      <Select
        className={styles.select}
        size="large"
        value={provider}
        onChange={(value) => onProviderChange(value as string)}
        options={[
          { value: "all", label: "All providers" },
          ...PROVIDER_FILTER_OPTIONS,
        ]}
        suffixIcon={<LayersIcon size={16} />}
        aria-label="按 provider 过滤"
      />

      <Button
        className={cn(styles.pinned, pinnedOnly && styles.pinnedActive)}
        size="large"
        icon={<StarIcon size={16} filled={pinnedOnly} />}
        aria-pressed={pinnedOnly}
        onClick={() => onPinnedChange(!pinnedOnly)}
      >
        Pinned
      </Button>

      <Segmented
        className={styles.view}
        size="large"
        value={view}
        onChange={(value) => onViewChange(value as ViewMode)}
        options={[
          {
            value: "list",
            label: (
              <span className={styles.viewLabel}>
                <ListIcon size={15} />
                List
              </span>
            ),
          },
          {
            value: "table",
            label: (
              <span className={styles.viewLabel}>
                <TableIcon size={15} />
                Table
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
