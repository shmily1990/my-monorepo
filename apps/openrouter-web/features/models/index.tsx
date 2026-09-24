"use client";

import { Button } from "@repo/ui";
import { useState } from "react";

import { BarChartIcon, CoinIcon } from "@/components/icons";

import { FilterSidebar } from "./components/filter-sidebar";
import { ModelList } from "./components/model-list";
import { ModelsTable } from "./components/models-table";
import { ModelsToolbar } from "./components/models-toolbar";
import type { ViewMode } from "./components/models-toolbar";
import { ModalityTabs } from "./components/modality-tabs";
import { FILTER_GROUPS, filterKey } from "./data/filters";
import type { FilterGroupId, SortKey } from "./data/filters";
import { MOCK_MODELS } from "./data/mock-models";
import type { Modality, Model } from "./model";
import styles from "./index.module.scss";

/*
 * 模型页。
 *
 * **整个应用唯一的客户端状态边界**：筛选、搜索、排序、视图切换的状态全部收在这里，
 * 子组件只接收数据与回调。这样 "use client" 只需要写在文件顶部一次 ——
 * 挂在客户端组件下面的子组件本来就已在客户端图里，再各自标一遍是噪音。
 *
 * 路由文件 app/(marketing)/models/page.tsx 保持服务端组件：它渲染一个客户端组件，
 * 拿到的是一个 client reference，这是合法的。
 */

/** 排序比较器。日期是 ISO 字符串，按字典序比较即等于按时间比较。 */
const COMPARATORS: Record<SortKey, (a: Model, b: Model) => number> = {
  newest: (a, b) =>
    a.releasedAt === b.releasedAt ? 0 : a.releasedAt < b.releasedAt ? 1 : -1,
  oldest: (a, b) =>
    a.releasedAt === b.releasedAt ? 0 : a.releasedAt < b.releasedAt ? -1 : 1,
  popular: (a, b) => b.monthlyTokens - a.monthlyTokens,
  cheapest: (a, b) => a.inputPricePerMillion - b.inputPricePerMillion,
};

function matchesSearch(model: Model, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    model.name.toLowerCase().includes(needle) ||
    model.id.toLowerCase().includes(needle) ||
    model.series.toLowerCase().includes(needle) ||
    model.description.toLowerCase().includes(needle)
  );
}

export function ModelsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [provider, setProvider] = useState("all");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [modality, setModality] = useState<Modality | "all">("all");
  const [selectedFilters, setSelectedFilters] = useState<ReadonlySet<string>>(
    new Set<string>(),
  );

  function toggleFilter(groupId: FilterGroupId, value: string) {
    setSelectedFilters((previous) => {
      const next = new Set(previous);
      const key = filterKey(groupId, value);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  /*
   * 先把每个分组里被选中的选项挑出来。
   * 组内取「或」（选了 Text 或 Image 都算），组间取「与」（必须同时满足每组至少一个）。
   * 没有任何选项被选中的分组直接丢掉，否则 .every() 会因为空数组恒真而失去意义 ——
   * 不过这里丢掉只是为了少做几次无谓判断。
   */
  const activeFilters = FILTER_GROUPS.map((group) => ({
    options: group.options.filter((option) =>
      selectedFilters.has(filterKey(group.id, option.value)),
    ),
  })).filter((entry) => entry.options.length > 0);

  // 只有十几条数据，过滤与排序直接内联；useMemo 在这里是纯粹的开销
  const visibleModels = MOCK_MODELS.filter((model) => {
    if (modality !== "all" && !model.modalities.includes(modality))
      return false;
    if (provider !== "all" && model.providerId !== provider) return false;
    if (pinnedOnly && !model.pinned) return false;
    if (!matchesSearch(model, search)) return false;

    return activeFilters.every((entry) =>
      entry.options.some((option) => option.test(model)),
    );
  }).sort(COMPARATORS[sort]);

  return (
    <main className={styles.page}>
      <FilterSidebar selected={selectedFilters} onToggle={toggleFilter} />

      <div className={styles.main}>
        <div className={styles.head}>
          <h1 className={styles.title}>Models</h1>

          <div className={styles.headActions}>
            {/* 用 Button 的 href 而不是套一层 Link：避免 a 里嵌 button 这种非法嵌套 */}
            <Button
              size="large"
              href="/compare"
              icon={<BarChartIcon size={16} />}
            >
              Compare
            </Button>

            <Button
              size="large"
              type="primary"
              href="/models"
              icon={<CoinIcon size={17} />}
              /* antd 6 里 iconPosition 已废弃，改名为 iconPlacement */
              iconPlacement="end"
            >
              Discover Models
            </Button>
          </div>
        </div>

        <ModelsToolbar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          provider={provider}
          onProviderChange={setProvider}
          pinnedOnly={pinnedOnly}
          onPinnedChange={setPinnedOnly}
          view={view}
          onViewChange={setView}
        />

        <ModalityTabs active={modality} onChange={setModality} />

        <div className={styles.results}>
          {visibleModels.length === 0 ? (
            <p className={styles.empty}>
              没有符合条件的模型。试着放宽筛选条件，或清空搜索词。
            </p>
          ) : view === "list" ? (
            <ModelList models={visibleModels} />
          ) : (
            <ModelsTable models={visibleModels} />
          )}
        </div>
      </div>
    </main>
  );
}
