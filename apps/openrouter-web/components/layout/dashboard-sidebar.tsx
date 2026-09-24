"use client";

import { Select } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  BarChartIcon,
  BellIcon,
  BringKeyIcon,
  CardIcon,
  FileModalityIcon,
  GearIcon,
  GridIcon,
  KeyIcon,
  LabelIcon,
  ListIcon,
  PulseIcon,
  RouteIcon,
  ShieldIcon,
  SlidersIcon,
  ToolboxIcon,
  UserIcon,
} from "@/components/icons";
import { DASHBOARD_NAV, DEFAULT_WORKSPACE_NAME } from "@/lib/dashboard-nav";
import type { DashboardIconKey } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils/cn";

import styles from "./dashboard-sidebar.module.scss";

/**
 * dashboard 路由组的左侧导航，对应 docs/workspace.jpg 的侧栏。
 *
 * 客户端组件，只为了一件事：`usePathname()` 判当前项。服务端组件拿不到路径名
 * （这不是它该知道的东西），所以这里是客户端。
 *
 * 数据在 lib/dashboard-nav.ts，图标映射留在这里 —— 数据文件不该 import 组件。
 * 下面的 Record 用完整类型而不是 Partial：往 `DashboardIconKey` 里加成员时，
 * 这里会编译报错提醒补图标，而不是在界面上静默留空。
 */
const ICONS: Record<DashboardIconKey, ReactNode> = {
  overview: <GridIcon size={17} />,
  "api-keys": <KeyIcon size={17} />,
  files: <FileModalityIcon size={17} />,
  guardrails: <ShieldIcon size={17} />,
  byok: <BringKeyIcon size={17} />,
  routing: <RouteIcon size={17} />,
  presets: <SlidersIcon size={17} />,
  tools: <ToolboxIcon size={17} />,
  observability: <PulseIcon size={17} />,
  classifiers: <LabelIcon size={17} />,
  settings: <GearIcon size={17} />,
  profile: <UserIcon size={17} />,
  activity: <BarChartIcon size={17} />,
  logs: <ListIcon size={17} />,
  credits: <CardIcon size={17} />,
  "management-keys": <KeyIcon size={17} />,
  notifications: <BellIcon size={17} />,
};

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="工作台导航">
      {/*
        工作区切换器。目前只有一个工作区，但用 Select 而不是一个死按钮 ——
        它是真实控件，将来多出几个工作区时不用改。
      */}
      <Select
        className={styles.switcher}
        size="large"
        value="default"
        aria-label="选择工作区"
        options={[{ value: "default", label: DEFAULT_WORKSPACE_NAME }]}
      />

      {DASHBOARD_NAV.map((group) => (
        <div className={styles.group} key={group.title ?? "primary"}>
          {group.title ? (
            <p className={styles.groupTitle}>{group.title}</p>
          ) : null}

          <ul className={styles.list}>
            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(styles.item, isActive && styles.itemActive)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className={styles.icon}>{ICONS[item.icon]}</span>
                    <span className={styles.label}>{item.label}</span>
                    {item.badge ? (
                      <span className={styles.badge}>{item.badge}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
