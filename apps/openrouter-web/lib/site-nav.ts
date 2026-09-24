/**
 * 站点导航数据。
 *
 * 集中在一处的理由：header 与 footer 的链接集合会重叠（Models / Pricing / Docs 两边都有），
 * 各写一份迟早不一致。
 *
 * 注意这些 href 目前大多指向**尚未实现的路由**（/benchmarks、/chat、/pricing…）。
 * 这在类型上是合法的：Next 16 的 typed routes 只作用于 `PageProps` / `LayoutProps` 的参数，
 * 并没有收窄 `next/link` 的 `href`（`href: string | UrlObject`）。
 * 但如果将来往 next.config.ts 里加了 `typedRoutes: true`，这些链接会全部变成类型错误 ——
 * 那时要么建路由，要么把 href 的类型放宽。
 */

export type NavItem = {
  label: string;
  href: string;
};

export const HEADER_NAV: readonly NavItem[] = [
  { label: "Models", href: "/models" },
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Chat", href: "/chat" },
  { label: "Rankings", href: "/rankings" },
  { label: "Apps", href: "/apps" },
  { label: "Ori", href: "/ori" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "编辑器", href: "/editor" },
];

/**
 * 登录后插到导航**最前面**的那一项。
 *
 * 未登录时整个不渲染 —— 这是产品要求（未登录不显示 Home）。判断放在
 * `components/layout/header-nav.tsx`，它从 SiteHeader 拿到 logged-in 状态。
 */
export const HOME_NAV_ITEM: NavItem = { label: "Home", href: "/workspaces" };

/**
 * 登录后右上角头像下拉里的条目。
 *
 * 参考图的那个下拉还有一排 日/夜/跟随系统 的主题开关，**本次不做** ——
 * 真实实现明暗主题要同时改 antd 主题与 styles/tokens.scss 的全部令牌，是独立一轮工作。
 */
export const USER_MENU_ITEMS: readonly NavItem[] = [
  { label: "Workspaces", href: "/workspaces" },
  { label: "Profile", href: "/workspaces/profile" },
  { label: "Activity", href: "/workspaces/activity" },
  { label: "Logs", href: "/workspaces/logs" },
  { label: "Credits", href: "/workspaces/credits" },
  { label: "Labs", href: "/labs" },
  { label: "Preferences", href: "/workspaces/preferences" },
];

export type FooterColumn = {
  title: string;
  items: readonly NavItem[];
};

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    items: [
      { label: "Chat", href: "/chat" },
      { label: "Models", href: "/models" },
      { label: "Rankings", href: "/rankings" },
      { label: "Apps", href: "/apps" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Developers",
    items: [
      { label: "Docs", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const FOOTER_LEGAL: readonly NavItem[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];
