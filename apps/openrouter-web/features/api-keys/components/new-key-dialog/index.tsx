"use client";

import { Button, Input, Modal } from "@repo/ui";
import { useState } from "react";

import { DollarIcon } from "@/components/icons";

import type { ApiKey } from "../../api-key";
import styles from "./index.module.scss";

/**
 * 新建 API key 的弹框。（参考图里只有那个紫色按钮，弹框本身没有原型，这里是按
 * 详情页的字段反推的：名称 + 可选信用额度。）
 *
 * 生成密钥用到的 `Date` 与随机数都发生在**点击事件里，纯客户端** ——
 * 新建出来的这条记录永远不会出现在服务端渲染的 HTML 里，所以不存在 hydration 问题。
 * 这是仓库里少数几个可以正大光明用 `Date` 的地方（`lib/utils/format.ts` 里那些
 * 刻意避开 `Date` 的函数是为了别的原因，见那里的说明）。
 *
 * **不展示完整密钥。** 真实产品会在创建那一刻把完整 key 显示一次（此后只剩打码值），
 * 但那是另一段交互（一次性展示 + 复制 + 警告），本次没做 —— 所以这里连完整值都不生成，
 * 免得留着一段假的密钥字符串被人当成真的。
 */
export function NewKeyDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (key: ApiKey) => void;
}) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");

  const canSubmit = name.trim().length > 0;

  function reset() {
    setName("");
    setLimit("");
  }

  function handleCreate() {
    if (!canSubmit) return;

    onCreate(buildApiKey(name, limit));
    reset();
    onClose();
  }

  function handleCancel() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="New Key"
      centered
      width={460}
      destroyOnHidden
      footer={
        <div className={styles.footer}>
          <Button size="large" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            Create key
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="new-key-name">
            Name
          </label>
          <Input
            id="new-key-name"
            className={styles.input}
            size="large"
            placeholder="e.g. Production backend"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="new-key-limit">
            Credit limit
          </label>
          <p className={styles.description}>
            Once the credits consumed by this key reach this amount, the key
            stops working. Leave blank for no limit.
          </p>
          <Input
            id="new-key-limit"
            className={styles.input}
            size="large"
            inputMode="decimal"
            prefix={<DollarIcon size={16} />}
            placeholder="No limit"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 本地日期 "2026-09-23"。与 formatDateTime 的输入约定一致（本地墙上时间，不带时区）。 */
function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalDateTime(date: Date): string {
  return `${toLocalDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildApiKey(name: string, limit: string): ApiKey {
  /*
   * id 不用 crypto.randomUUID()：那个要求安全上下文，而同一个 dev server 通过
   * `http://<局域网IP>:3002` 访问时并非安全上下文，randomUUID 会是 undefined。
   * 时间戳 + 随机后缀在任何上下文都可用，对 mock 也够用。
   */
  const id = `key-${Date.now().toString(36)}${Math.floor(
    Math.random() * 1e6,
  ).toString(36)}`;

  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 6);

  const parsedLimit = Number(limit.trim());
  const hasLimit = limit.trim() !== "" && Number.isFinite(parsedLimit);

  return {
    id,
    name: name.trim(),
    // 只生成打码值 —— 完整密钥不在这里生成，理由见组件上方的说明
    maskedKey: `sk-or-v1-${id.slice(-6, -3)}...${id.slice(-3)}`,
    createdAt: toLocalDate(now),
    expiresAt: toLocalDateTime(expires),
    guardrails: [],
    lastUsedAt: null,
    usageUsd: 0,
    limitUsd: hasLimit ? parsedLimit : null,
    limitReset: "never",
    enabled: true,
  };
}
