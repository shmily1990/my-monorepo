import Link from "next/link";

import { OpenRouterLogo } from "@/components/brand/openrouter-logo";
import { HeaderAuth } from "@/components/layout/header-auth";
import { HeaderNav } from "@/components/layout/header-nav";
import { HeaderSearch } from "@/components/layout/header-search";
import { getSession } from "@/lib/auth/session";

import styles from "./site-header.module.scss";

/**
 * 站点吸顶导航。
 *
 * **服务端组件**，而且是全站唯一的 header —— `(marketing)` 与 `(dashboard)` 两个路由组都用它，
 * 所以它不再叫 marketing-header（它不只属于 marketing）。页脚相反：只有 marketing 有，
 * 所以 marketing-footer 那个名字是准确的。这个不对称是有意的。
 *
 * 它读会话来决定两件事：导航里是否出现 Home、右上角显示 Sign Up 还是用户菜单。
 * 读 cookie 会让路由进入动态渲染 —— 这是 Next 16 的既定行为（`cacheComponents` 未开启时
 * 无解），也正是 `/` 与 `/models` 从预渲染静态变成每次请求 SSR 的原因。详见
 * `lib/auth/session.ts` 的文件头。
 *
 * 另外两处会话读取点在 `app/(dashboard)/layout.tsx` 与 workspaces 页；它们与这里共享
 * 同一个 `cache()`，一次请求只读一次 cookie。
 */
export async function SiteHeader() {
  const user = await getSession();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 可访问名由 logo 里的文字标提供 */}
        <Link href="/" className={styles.brand}>
          <OpenRouterLogo />
        </Link>

        <HeaderSearch />

        <HeaderNav showHome={user !== null} />

        <HeaderAuth user={user} />
      </div>
    </header>
  );
}
