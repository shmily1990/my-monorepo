import { ApiKeysPage } from "@/features/api-keys";
import { verifySession } from "@/lib/auth/session";

/**
 * 路由 `/workspaces/api-keys`。侧栏「API Keys」那一项指向的就是这里。
 *
 * 守卫在这里再查一次（`(dashboard)/layout.tsx` 里已经查过）：Next 官方指南要求检查
 * 「靠近数据源」，因为 layout 在导航时不会重新渲染。`verifySession()` 有 `cache()`，
 * 与 layout 那次共享同一次 cookie 读取。
 */
export default async function Page() {
  await verifySession();

  return <ApiKeysPage />;
}
