"use client";

import { Checkbox } from "@repo/ui";
import type { ReactNode } from "react";

import {
  BanIcon,
  DollarIcon,
  DropletIcon,
  GridIcon,
  InputsIcon,
  PercentIcon,
  RulerIcon,
  SlidersIcon,
  TagIcon,
} from "@/components/icons";

import { FILTER_GROUPS, filterKey } from "../../data/filters";
import type { FilterGroupId } from "../../data/filters";
import { FilterSection } from "../filter-section";
import styles from "./index.module.scss";

/**
 * 分组 id → 图标。
 *
 * 映射留在组件里而不是塞进 data/filters.ts：图标是展示层的东西，数据文件不该 import 组件。
 */
const GROUP_ICONS: Record<FilterGroupId, ReactNode> = {
  "input-modalities": <InputsIcon size={17} />,
  discounted: <PercentIcon size={17} />,
  "context-length": <RulerIcon size={17} />,
  "prompt-pricing": <DollarIcon size={17} />,
  series: <TagIcon size={17} />,
  categories: <GridIcon size={17} />,
  "supported-parameters": <SlidersIcon size={17} />,
  distillable: <DropletIcon size={17} />,
  "zero-data-retention": <BanIcon size={17} />,
};

/**
 * 左侧筛选栏。
 *
 * 勾选框用 @repo/ui 的 Checkbox（属于表单控件，按约定走 UI 层）；
 * 折叠行是 FilterSection，手写。勾选状态由父组件持有 —— 主列要用它过滤，
 * 所以不能留在侧栏内部。
 */
export function FilterSidebar({
  selected,
  onToggle,
}: {
  selected: ReadonlySet<string>;
  onToggle: (groupId: FilterGroupId, value: string) => void;
}) {
  return (
    <aside className={styles.sidebar} aria-label="模型筛选">
      {FILTER_GROUPS.map((group) => (
        <FilterSection
          key={group.id}
          icon={GROUP_ICONS[group.id]}
          label={group.label}
          defaultOpen={group.defaultOpen}
        >
          {group.options.map((option) => (
            <Checkbox
              key={option.value}
              className={styles.checkbox}
              checked={selected.has(filterKey(group.id, option.value))}
              onChange={() => onToggle(group.id, option.value)}
            >
              {option.label}
            </Checkbox>
          ))}
        </FilterSection>
      ))}
    </aside>
  );
}
