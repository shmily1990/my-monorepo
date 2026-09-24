import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { verifySession } from "@/lib/auth/session";

import styles from "./layout.module.scss";

/**
 * 登录后工作台的路由组。`(dashboard)` 是路由组，不产生 URL 段 ——
 * 所以 `(dashboard)/workspaces/page.tsx` 服务的是 `/workspaces`。
 *
 * **这里有一道守卫**（`verifySession()`，未登录会 redirect 回首页）。Next 官方指南提醒
 * 「检查要靠近数据源，不要只依赖 layout」—— 因为 layout 在导航时不会重新渲染，也不控制
 * 同级路由段是否渲染。所以这不是唯一的检查：workspaces 页自己也会调一次。
 * 两处共享同一个 `cache()`，一次请求只读一次 cookie，代价可以忽略。
 *
 * 放在 layout 的这道的价值是：未登录时连侧栏外壳都不会被渲染出来。
 *
 * 没有页脚 —— 参考图里 dashboard 没有页脚，页脚只属于 marketing。
 */
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 只要守卫，不留值：侧栏不显示用户信息（身份块在主列，由页面自己渲染）
  await verifySession();

  return (
    <>
      <SiteHeader />

      <div className={styles.shell}>
        <DashboardSidebar />

        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}
