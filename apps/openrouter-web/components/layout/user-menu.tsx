"use client";

import { Avatar, Dropdown } from "@repo/ui";
import Link from "next/link";
import { useTransition } from "react";
import type { ComponentProps } from "react";

import { ChevronDownIcon, UserIcon } from "@/components/icons";
import { signOutAction } from "@/features/auth/actions";
import type { AuthUser } from "@/lib/auth/types";
import { USER_MENU_ITEMS } from "@/lib/site-nav";

import styles from "./user-menu.module.scss";

/**
 * 登录后右上角的头像菜单，对应 docs/workspace.jpg 里那个「Personal」下拉。
 *
 * 两处刻意的简化（参考图的对应部分不做）：
 *   1. 参考图的下拉顶部重复了一行「小头像 + Personal + 齿轮」，这里**不做** ——
 *      触发器上已经有头像和名字，再重复一遍只是噪音；齿轮对应的「Preferences」在菜单里。
 *   2. 参考图底部的 日/夜/跟随系统 主题开关**不做** —— 仓库没有暗色主题，
 *      放一个点了没反应的控件比不放更糟；真实做起来要同时改 antd 主题与全部 SCSS 令牌。
 * 菜单项的图标也略去了：那需要把「条目 → 图标」的映射从侧栏抽出来共享，
 * 为七个图标增加一层耦合不划算。
 */

/*
 * 从 Dropdown 自己的 props 里取出 items 的类型。
 *
 * **不能** `import type { MenuProps } from "antd"`：应用没有直接依赖 antd，
 * `import/no-extraneous-dependencies` 会拦下它 —— 而那正是"应用不碰 antd"这条边界的
 * 作用方式。从组件 props 反推既能拿到准确类型，也不必引入任何东西。
 */
type DropdownMenuItems = NonNullable<
  ComponentProps<typeof Dropdown>["menu"]
>["items"];

export function UserMenu({ user }: { user: AuthUser }) {
  const [isSigningOut, startTransition] = useTransition();

  const items: DropdownMenuItems = [
    ...USER_MENU_ITEMS.map((item) => ({
      key: item.href,
      label: (
        <Link href={item.href} className={styles.menuLink}>
          {item.label}
        </Link>
      ),
    })),

    { type: "divider" },

    {
      key: "signout",
      /* antd 自带的 danger，直接给出参考图里那个红色 Sign Out，不必写 CSS */
      danger: true,
      label: isSigningOut ? "Signing out…" : "Sign Out",
    },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items,
        onClick: ({ key }) => {
          if (key !== "signout") return;

          /*
           * 服务端函数必须在 transition 里调用 —— 这是 React 对「从事件处理器而非
           * 表单提交触发 action」的要求，否则 React 会告警。
           */
          startTransition(() => {
            void signOutAction();
          });
        },
      }}
    >
      <button
        type="button"
        className={styles.trigger}
        /*
         * 触发器上显示的是工作区名「Personal」（参考图如此），不是用户名 ——
         * 所以把用户名放进可访问名里，读屏才听得出当前登录的是谁。
         */
        aria-label={`Account menu for ${user.name}`}
      >
        <Avatar
          className={styles.avatar}
          size={30}
          icon={<UserIcon size={17} />}
        />
        <span className={styles.name}>Personal</span>
        <ChevronDownIcon size={15} className={styles.chevron} />
      </button>
    </Dropdown>
  );
}
