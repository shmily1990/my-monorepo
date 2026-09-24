"use client";

import { Button } from "@repo/ui";
import { useState } from "react";

import { InfoIcon, PlusIcon } from "@/components/icons";

import type { ApiKey } from "./api-key";
import { KeyListCard } from "./components/key-list-card";
import { NewKeyDialog } from "./components/new-key-dialog";
import { MOCK_API_KEYS } from "./data/mock-api-keys";
import styles from "./index.module.scss";

/*
 * API Keys 列表页，对应 docs/apikey.jpg。
 *
 * 与 models / workspaces 同一套约定：**唯一的客户端状态边界在这里** ——
 * 列表、搜索词、勾选集合、弹框开关全在这一层，子组件只接收数据与回调。
 *
 * key 列表放在 state 里而不是直接读常量，是为了让「New Key」新建出来的那条能真的出现
 * 在表格里。**这些改动只活在内存中**：刷新、返回列表都会回到 `MOCK_API_KEYS` 的样子 ——
 * 没有后端，这是本次已知的边界。
 *
 * 详情页在 `./detail.tsx`。两个页面同属一个 feature，因为共用 `api-key.ts` 与
 * `data/mock-api-keys.ts`；这是对「一个 feature 一个页面」的小扩展，已记在 AGENTS.md。
 */

const INITIAL_SELECTION: ReadonlySet<string> = new Set<string>();

/** 名称与打码后的密钥都能搜 —— 参考图的占位符是 "Search by name or paste a key..." */
function matchesSearch(key: ApiKey, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return (
    key.name.toLowerCase().includes(needle) ||
    key.maskedKey.toLowerCase().includes(needle)
  );
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<readonly ApiKey[]>(MOCK_API_KEYS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] =
    useState<ReadonlySet<string>>(INITIAL_SELECTION);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleKeys = keys.filter((key) => matchesSearch(key, search));

  function toggleOne(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  /*
   * 全选只作用于**当前可见**（已过滤）的行 —— 否则搜索之后点全选会悄悄选上
   * 屏幕上根本看不到的 key。全部已选则清空。
   */
  function toggleAll() {
    setSelected((previous) =>
      visibleKeys.length > 0 && visibleKeys.every((key) => previous.has(key.id))
        ? INITIAL_SELECTION
        : new Set(visibleKeys.map((key) => key.id)),
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>API Keys</h1>
          <p className={styles.subtitle}>
            Create and manage your API keys.
            <InfoIcon size={15} className={styles.infoIcon} />
          </p>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusIcon size={16} />}
          onClick={() => setDialogOpen(true)}
        >
          New Key
        </Button>
      </div>

      <KeyListCard
        keys={visibleKeys}
        totalCount={keys.length}
        selected={selected}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
        search={search}
        onSearchChange={setSearch}
      />

      <NewKeyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(key) => setKeys((previous) => [key, ...previous])}
      />
    </main>
  );
}
