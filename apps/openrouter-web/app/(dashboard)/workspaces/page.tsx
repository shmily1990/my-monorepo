import { WorkspacesPage } from "@/features/workspaces";
import { verifySession } from "@/lib/auth/session";

/**
 * 路由 `/workspaces`。`(dashboard)` 是路由组，不产生 URL 段 —— 所以路径就是 `/workspaces`。
 *
 * 守卫在这里**再查一次**，不只是因为 layout 里已经查过：Next 官方指南明确要求
 * 「检查要靠近数据源」，并提醒 layout 在导航时不会重新渲染、也不控制同级路由段是否渲染。
 * `verifySession()` 是 `cache()` 过的，与 layout 那次共享同一次 cookie 读取，代价可忽略。
 *
 * 拿到的 `user` 直接传给页面，省掉客户端再取一次会话。
 */
export default async function Page() {
  const user = await verifySession();

  return <WorkspacesPage user={user} />;
}
