"use client";

import { Dropdown } from "@repo/ui";
import Link from "next/link";
import type { ComponentProps } from "react";

import {
  BanIcon,
  BarChartIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";

import styles from "./index.module.scss";

/*
 * 从 Dropdown 自己的 props 反推 items 的类型。**不能** `import type { MenuProps } from "antd"`
 * —— 应用没有直接依赖 antd，`import/no-extraneous-dependencies` 会拦下（那正是这条边界的作用）。
 * 同样的写法见 components/layout/user-menu.tsx。
 */
type DropdownMenuItems = NonNullable<
  ComponentProps<typeof Dropdown>["menu"]
>["items"];

/**
 * 表格行尾那个 ⋮ 菜单，对应 docs/apikey.jpg 右下展开的那一列。
 *
 * **只有 `Edit` 真正生效** —— 它是一个 `<Link>`，能点击跳转，也能中键新开。
 * `Activity` / `Disable` / `Delete` 三项按本次的取舍**刻意不绑任何行为**：
 * 它们是为了还原参考图的菜单结构，不是漏了实现。**这不是 bug，别顺手"修"它。**
 * 真要做的话：Activity → 补一个 `/workspaces/api-keys/<id>/activity` 路由；
 * Disable / Delete → 改这一行的 `enabled` / 从列表里移除（都需要把状态提到页面层）。
 */
export function KeyRowActions({
  keyId,
  keyName,
}: {
  keyId: string;
  keyName: string;
}) {
  const items: DropdownMenuItems = [
    { key: "activity", icon: <BarChartIcon size={16} />, label: "Activity" },
    {
      key: "edit",
      icon: <PencilIcon size={16} />,
      label: (
        <Link
          href={`/workspaces/api-keys/${keyId}`}
          className={styles.menuLink}
        >
          Edit
        </Link>
      ),
    },
    { key: "disable", icon: <BanIcon size={16} />, label: "Disable" },
    { key: "delete", icon: <TrashIcon size={16} />, label: "Delete" },
  ];

  return (
    <Dropdown trigger={["click"]} placement="bottomRight" menu={{ items }}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`${keyName} 的操作`}
      >
        <MoreVerticalIcon size={17} />
      </button>
    </Dropdown>
  );
}
