import Link from "next/link";

import { HEADER_NAV, HOME_NAV_ITEM } from "@/lib/site-nav";

import styles from "./header-nav.module.scss";

/**
 * header 中部的导航链接。
 *
 * **服务端组件** —— 这里全是 `<Link>`，没有任何 antd 组件，所以不需要 "use client"。
 * 导航项来自 `lib/site-nav.ts`，与页脚共用同一份数据。
 *
 * `showHome` 由 `SiteHeader` 从会话里得出：登录后 Home 插到**最前面**，未登录时整个不渲染
 * （产品要求：未登录不显示 Home。未登录点进去只会被 /workspaces 的守卫弹回首页，
 * 那是一个注定失败的入口，不该出现在导航里）。
 *
 * 右上角的认证区不在这里 —— 它是客户端组件（要开弹框、要读会话用户），
 * 见 `./header-auth.tsx`。
 */
export function HeaderNav({ showHome }: { showHome: boolean }) {
  const items = showHome ? [HOME_NAV_ITEM, ...HEADER_NAV] : HEADER_NAV;

  return (
    <nav className={styles.nav} aria-label="主导航">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
