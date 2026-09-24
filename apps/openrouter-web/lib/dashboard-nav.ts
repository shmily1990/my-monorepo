/**
 * dashboard 侧栏导航数据。
 *
 * 与 `lib/site-nav.ts` 分开放：那边的链接是公开站点导航，这边是登录后的工作台侧栏，
 * 还带 Beta 徽标这类只属于侧栏的东西。
 *
 * 图标只存**键名**，映射在 `components/layout/dashboard-sidebar.tsx` 里 ——
 * 数据文件不该 import 组件。
 */

export type DashboardIconKey =
  | "overview"
  | "api-keys"
  | "files"
  | "guardrails"
  | "byok"
  | "routing"
  | "presets"
  | "tools"
  | "observability"
  | "classifiers"
  | "settings"
  | "profile"
  | "activity"
  | "logs"
  | "credits"
  | "management-keys"
  | "notifications";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: DashboardIconKey;
  /** 右侧小徽标，参考图里 Files 与 Classifiers 带 Beta */
  badge?: string;
};

export type DashboardNavGroup = {
  /** 分组小标题。第一个分组没有标题（参考图里直接就是条目列表） */
  title?: string;
  items: readonly DashboardNavItem[];
};

/**
 * 除 `/workspaces` 之外都指向**尚未实现**的路由，与 header 现有链接的做法一致
 * （Next 16 的 typed routes 并不收窄 `next/link` 的 `href`，所以这些链接类型合法）。
 */
export const DASHBOARD_NAV: readonly DashboardNavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/workspaces", icon: "overview" },
      { label: "API Keys", href: "/workspaces/api-keys", icon: "api-keys" },
      {
        label: "Files",
        href: "/workspaces/files",
        icon: "files",
        badge: "Beta",
      },
      {
        label: "Guardrails",
        href: "/workspaces/guardrails",
        icon: "guardrails",
      },
      { label: "BYOK", href: "/workspaces/byok", icon: "byok" },
      { label: "Routing", href: "/workspaces/routing", icon: "routing" },
      { label: "Presets", href: "/workspaces/presets", icon: "presets" },
      { label: "Tools", href: "/workspaces/tools", icon: "tools" },
      {
        label: "Observability",
        href: "/workspaces/observability",
        icon: "observability",
      },
      {
        label: "Classifiers",
        href: "/workspaces/classifiers",
        icon: "classifiers",
        badge: "Beta",
      },
      { label: "Settings", href: "/workspaces/settings", icon: "settings" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/workspaces/profile", icon: "profile" },
      { label: "Activity", href: "/workspaces/activity", icon: "activity" },
      { label: "Logs", href: "/workspaces/logs", icon: "logs" },
      { label: "Credits", href: "/workspaces/credits", icon: "credits" },
      {
        label: "Management Keys",
        href: "/workspaces/management-keys",
        icon: "management-keys",
      },
      {
        label: "Notifications",
        href: "/workspaces/notifications",
        icon: "notifications",
      },
    ],
  },
];

/** 侧栏顶部那个 workspace 切换器上的名字。 */
export const DEFAULT_WORKSPACE_NAME = "Default Workspace";
