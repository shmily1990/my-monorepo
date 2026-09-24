"use client";

import { App, Button, Input, Select } from "@repo/ui";
import { useState } from "react";

import { DollarIcon } from "@/components/icons";
import { formatDateTime } from "@/lib/utils/format";

import type { ApiKey, ResetLimit } from "./api-key";
import { DetailField } from "./components/detail-field";
import { DetailHeader } from "./components/detail-header";
import { SpendCard } from "./components/spend-card";
import { RESET_LIMIT_OPTIONS } from "./data/mock-api-keys";
import styles from "./detail.module.scss";

/*
 * API key 详情页，对应 docs/edit.jpg。路由是 /workspaces/api-keys/<id>。
 *
 * 两个页面同属 `features/api-keys/`：列表在 `index.tsx`，详情在这里。共用 `api-key.ts`
 * 与 `data/mock-api-keys.ts`，所以放在同一个 feature 里比拆成两个再互相 import 更直接。
 *
 * 状态由本页持有（字段都在这一层受控），子组件只负责排布。
 */

const SPEND_WINDOW_DAYS = 30;

export function ApiKeyDetail({ apiKey }: { apiKey: ApiKey }) {
  /*
   * `App.useApp()` 是仓库规定的取 message 的方式（见根 AGENTS.md 规则 2.7）：
   * 从 antd 直接 import 静态 message 拿不到 ConfigProvider 的主题，React 19 下还会告警。
   * `UiProvider` 已经包了一层 antd 的 `<App>`，所以这里的上下文是现成的。
   */
  const { message } = App.useApp();

  // 表单是受控的 —— 提交失败（这里是 mock，不存在失败）或切走再回来都不会丢用户输入
  const [name, setName] = useState(apiKey.name);
  const [limit, setLimit] = useState(toLimitInput(apiKey.limitUsd));
  const [resetLimit, setResetLimit] = useState<ResetLimit>(apiKey.limitReset);

  const isDirty =
    name !== apiKey.name ||
    limit !== toLimitInput(apiKey.limitUsd) ||
    resetLimit !== apiKey.limitReset;

  function handleSave() {
    /*
     * mock：只弹一句提示，**没有任何东西被持久化**。返回列表页时这条改动不会保留。
     * 真实实现这里应该是一个 Server Action 或 API 调用，成功后 revalidate。
     *
     * 参考图上并没有这个按钮（原型的字段看起来是自动保存的），这里是刻意加的：
     * 一个能编辑但没有提交入口的表单，比多一个按钮更糟。
     */
    message.success("Changes saved");
  }

  return (
    <main className={styles.page}>
      <DetailHeader apiKey={apiKey} />

      <section className={styles.card}>
        <DetailField
          label="Name"
          description="Choose a clear, descriptive name to identify this key."
          htmlFor="key-name"
        >
          <Input
            id="key-name"
            className={styles.control}
            size="large"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DetailField>

        <DetailField
          label="Expiration"
          description="Expiration cannot be modified. Create a new API key for a new expiration time."
          htmlFor="key-expiration"
        >
          {/* 只读而不是 disabled：disabled 的文字对比度会被 antd 压到很难读 */}
          <Input
            id="key-expiration"
            className={styles.control}
            size="large"
            readOnly
            value={formatDateTime(apiKey.expiresAt)}
          />
        </DetailField>

        <DetailField
          label="Credit limit"
          description="Once the credits ($USD) consumed by this key reach this amount, the key stops working. Leave blank for no limit."
          htmlFor="key-limit"
        >
          <Input
            id="key-limit"
            className={styles.control}
            size="large"
            inputMode="decimal"
            prefix={<DollarIcon size={16} />}
            placeholder="No limit"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </DetailField>

        <DetailField
          label="Reset limit"
          description="When the credit limit resets — daily at midnight UTC, weekly on Monday, or monthly on the 1st."
          htmlFor="key-reset"
        >
          <Select
            id="key-reset"
            className={styles.control}
            size="large"
            value={resetLimit}
            onChange={(value) => setResetLimit(value as ResetLimit)}
            options={[...RESET_LIMIT_OPTIONS]}
          />
        </DetailField>

        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            disabled={!isDirty}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>
      </section>

      <SpendCard days={SPEND_WINDOW_DAYS} amountUsd={apiKey.usageUsd} />
    </main>
  );
}

/** 额度 → 输入框的值。null（不限额）对应空字符串，与占位符 "No limit" 一致。 */
function toLimitInput(limitUsd: number | null): string {
  return limitUsd === null ? "" : String(limitUsd);
}
