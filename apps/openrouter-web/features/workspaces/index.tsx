"use client";

import { useState } from "react";

import type { AuthUser } from "@/lib/auth/types";

import { ActivityPanel } from "./components/activity-panel";
import { UsageSummary } from "./components/usage-summary";
import { WorkspaceIdentity } from "./components/workspace-identity";
import { DEFAULT_METRIC, DEFAULT_RANGE } from "./data/usage";
import type { UsageMetric, UsageRange } from "./data/usage";
import styles from "./index.module.scss";

/*
 * 工作区概览页，对应 docs/workspace.jpg。
 *
 * 与 models 页同一套约定：**唯一的客户端状态边界在这里**（时间范围与指标两项），
 * 子组件只接收数据与回调，不各自持状态。
 *
 * 页面本身**不读会话** —— `user` 由路由文件（服务端）调 `verifySession()` 拿到后传进来。
 * 这样守卫与数据显示共用同一次读取（`verifySession` 有 `cache()`），也避免客户端组件
 * 去碰 cookie。
 */
export function WorkspacesPage({ user }: { user: AuthUser }) {
  const [range, setRange] = useState<UsageRange>(DEFAULT_RANGE);
  const [metric, setMetric] = useState<UsageMetric>(DEFAULT_METRIC);

  return (
    <main className={styles.page}>
      <WorkspaceIdentity user={user} />

      <UsageSummary
        range={range}
        onRangeChange={setRange}
        metric={metric}
        onMetricChange={setMetric}
      />

      <ActivityPanel />
    </main>
  );
}
