/*
 * API key 的类型。
 *
 * 与 `features/models/model.ts`、`lib/auth/types.ts` 同一个判断：**留在应用内，不进
 * `@repo/x-typings`** —— 只有一个包需要它、没有运行时校验、没有第二个消费方。
 * 真实实现接手时若某个 route handler 开始 parse 这个形状，再提升为 Zod schema。
 */

/** 额度的重置周期。`never` 表示总额度（参考图表格里的 "TOTAL" 标记）。 */
export type ResetLimit = "never" | "daily" | "weekly" | "monthly";

export type ApiKey = {
  /** 路由段，如 "default" → /workspaces/api-keys/default */
  id: string;
  name: string;
  /**
   * 打码后的密钥，如 "sk-or-v1-d6b...899"。
   *
   * **只存打码值**：真实产品里完整密钥只在创建那一刻返回一次，服务端也只保存哈希。
   * mock 里连完整值都不生成，免得不小心把它渲染出来。
   */
  maskedKey: string;
  /** 本地日期时间 "2027-03-22T15:54"，展示走 formatDateTime */
  expiresAt: string;
  /** 本地日期 "2026-09-23" */
  createdAt: string;
  /** 空数组 → 表格里显示 "No guardrails" */
  guardrails: readonly string[];
  /** null → 显示 "Never" */
  lastUsedAt: string | null;
  /** 该 key 已消耗的额度（美元） */
  usageUsd: number;
  /** 信用额度上限；null 表示不限额（详情页留空） */
  limitUsd: number | null;
  limitReset: ResetLimit;
  enabled: boolean;
};
