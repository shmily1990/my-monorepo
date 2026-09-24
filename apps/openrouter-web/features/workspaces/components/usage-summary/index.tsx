import { Segmented, Select } from "@repo/ui";

import {
  USAGE_EMPTY_NOTE,
  USAGE_METRICS,
  USAGE_RANGES,
  USAGE_TOTALS,
} from "../../data/usage";
import type { UsageMetric, UsageRange } from "../../data/usage";
import { TopModels } from "../top-models";
import { UsageChart } from "../usage-chart";
import styles from "./index.module.scss";

/**
 * Usage summary 区块：标题 + 时间范围 + 指标切换 + 大数字 + 图表区。
 *
 * 时间是 `Select`、指标是 `Segmented` —— 都是 @repo/ui 的表单控件，与 models 页工具栏
 * 的用法一致。两者是**真控件**：切换指标会把大数字一起换掉（$0.00 → 0），
 * 而不是一个点了没反应的装饰。
 *
 * 状态不在本组件里 —— 由 `features/workspaces/index.tsx` 持有，原因同 models 页。
 */
export function UsageSummary({
  range,
  onRangeChange,
  metric,
  onMetricChange,
}: {
  range: UsageRange;
  onRangeChange: (range: UsageRange) => void;
  metric: UsageMetric;
  onMetricChange: (metric: UsageMetric) => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>Usage summary</h2>

        <Select
          className={styles.range}
          size="large"
          value={range}
          onChange={(value) => onRangeChange(value as UsageRange)}
          options={[...USAGE_RANGES]}
          aria-label="统计时间范围"
        />

        <Segmented
          className={styles.metric}
          size="large"
          value={metric}
          onChange={(value) => onMetricChange(value as UsageMetric)}
          options={[...USAGE_METRICS]}
        />
      </div>

      <div className={styles.figure}>
        <p className={styles.total}>{USAGE_TOTALS[metric]}</p>
        <p className={styles.note}>{USAGE_EMPTY_NOTE}</p>
      </div>

      <div className={styles.split}>
        <UsageChart />
        <TopModels />
      </div>
    </section>
  );
}
