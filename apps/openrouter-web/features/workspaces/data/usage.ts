/**
 * workspaces 页的样例数据。
 *
 * **全是 0 —— 这是照参考图做的，不是偷懒。** `docs/workspace.jpg` 本身就是一个新账号：
 * `$0.00`、`No prior data`、热力图几乎全空。编造一组好看的用量数字反而会掩盖真实的空态。
 *
 * **确定性是硬要求。** 这个文件里不允许出现 `Date.now()` / `new Date()` / `Math.random()` /
 * `toLocaleDateString` / `localeCompare` —— 同一个组件会先在服务端渲染一次、再在客户端
 * 渲染一次，任何依赖运行环境或当前时间的值都会造成 hydration mismatch。
 * `lib/utils/format.ts` 与 `features/models/data/filters.ts` 已经为同样的理由避开了它们。
 * 所以横轴日期与热力图月份都是写死的常量。
 */

/* ---------------------------------------------------------------------------
 * 用量摘要
 * ------------------------------------------------------------------------- */

export const USAGE_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
] as const;

export type UsageRange = (typeof USAGE_RANGES)[number]["value"];

export const USAGE_METRICS = [
  { value: "tokens", label: "Tokens" },
  { value: "spend", label: "Spend" },
  { value: "requests", label: "Requests" },
] as const;

export type UsageMetric = (typeof USAGE_METRICS)[number]["value"];

export const DEFAULT_RANGE: UsageRange = "7d";

/** 参考图里选中的是 Spend */
export const DEFAULT_METRIC: UsageMetric = "spend";

/** 大数字随指标变化 —— 这样切换分段控件是有反馈的，而不是一个假控件。 */
export const USAGE_TOTALS: Record<UsageMetric, string> = {
  tokens: "0",
  spend: "$0.00",
  requests: "0",
};

export const USAGE_EMPTY_NOTE = "No prior data";

/** 图表的横轴。参考图是 9/16 … 9/22，写死而不是由"今天"推。 */
export const USAGE_AXIS_DATES = [
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-19",
  "2026-09-20",
  "2026-09-21",
  "2026-09-22",
] as const;

/** 图表右侧那两栏的标题。参考图各带一句「本周期内没有用量」。 */
export const TOP_MODELS_TITLES = [
  "Daily by model",
  "Top models by spend",
] as const;

export const TOP_MODELS_EMPTY = "No usage in this period.";

/* ---------------------------------------------------------------------------
 * Activity
 * ------------------------------------------------------------------------- */

export type ActivityStat = {
  label: string;
  value: string;
};

export const ACTIVITY_STATS: readonly ActivityStat[] = [
  { label: "Longest streak", value: "0 days" },
  { label: "Avg / day", value: "$0" },
  { label: "Avg / week", value: "$0" },
  { label: "Total", value: "$0" },
];

/* ---------------------------------------------------------------------------
 * 贡献热力图
 * ------------------------------------------------------------------------- */

/** 列数（周）。参考图约一年 —— 53 周 */
export const HEATMAP_WEEKS = 53;

/** 只画三行（周一 / 周三 / 周五），与参考图一致 —— 它是采样行，不是完整七天 */
export const HEATMAP_ROWS = ["M", "W", "F"] as const;

/** 月份标签。与横轴同理，写死；用 space-between 均匀铺开，不逐列对齐。 */
export const HEATMAP_MONTHS = [
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
] as const;

/** 图例档数。0 档是空格子，1..3 对应 --or-heat-1/2/3。 */
export const HEATMAP_LEVELS = 3;
