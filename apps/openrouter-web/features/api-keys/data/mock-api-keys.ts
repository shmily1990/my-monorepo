import type { ApiKey, ResetLimit } from "../api-key";

/**
 * API key 的样例数据。
 *
 * 只有一条，数值与文案取自 docs/apikey.jpg 与 docs/edit.jpg 里那条 "Default key" ——
 * 两张参考图画的是同一个 key 的列表行与详情页，所以这里也就是一条。
 *
 * 用类型标注而不是 `satisfies`：见 `features/models/data/mock-models.ts` 的说明 ——
 * `satisfies` 会保留字面量窄类型，调用方一旦写 `guardrails.includes(x)` 就会报
 * "not assignable to parameter of type ..."。
 */
export const MOCK_API_KEYS: readonly ApiKey[] = [
  {
    id: "default",
    name: "Default key",
    maskedKey: "sk-or-v1-d6b...899",
    createdAt: "2026-09-23",
    expiresAt: "2027-03-22T15:54",
    guardrails: [],
    lastUsedAt: null,
    usageUsd: 0,
    limitUsd: 100,
    limitReset: "never",
    enabled: true,
  },
];

/** 按 id 取 key，找不到返回 null（详情页据此调用 notFound()）。 */
export function findApiKey(id: string): ApiKey | null {
  return MOCK_API_KEYS.find((key) => key.id === id) ?? null;
}

/** 「Reset limit」下拉的选项。 */
export const RESET_LIMIT_OPTIONS = [
  { value: "never", label: "N/A" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const satisfies readonly { value: ResetLimit; label: string }[];

/** 表格里额度后面那个小标记。`never` 是总额度，其余是周期性重置。 */
export function limitKindLabel(reset: ResetLimit): string {
  return reset === "never" ? "TOTAL" : "RESET";
}
