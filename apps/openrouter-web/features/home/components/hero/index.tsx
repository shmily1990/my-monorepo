"use client";

import Link from "next/link";

import { CoinIcon } from "@/components/icons";
import { useAuthDialog } from "@/features/auth";

import styles from "./index.module.scss";

/**
 * 首屏。
 *
 * 客户端组件，因为「Get API Key」要打开登录弹框（那个状态挂在根 layout 的 provider 上）。
 *
 * 两个 CTA 都不用 `@repo/ui` 的 `Button`：它们需要参考图里那套精确的尺寸与圆角，
 * 属于"视觉壳"，走 SCSS；`@repo/ui` 留给真正的表单控件。
 *
 * 「Get API Key」**不再是一个链接**：它原先指向 `/signup` —— 一个永远不会存在的路由
 * （登录是弹框，没有登录页）。现在它是一个按钮，语义正确，也顺带修掉了一个死链。
 * 代价是它需要 JS —— 但打开弹框本来就需要 JS。
 */
export function Hero() {
  const { openAuth } = useAuthDialog();

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        The Unified Interface
        <br />
        For Every Model
      </h1>

      <p className={styles.subtitle}>
        <Link href="/pricing" className={styles.underline}>
          Better prices
        </Link>
        ,{" "}
        <Link href="/status" className={styles.underline}>
          better uptime
        </Link>
        , no subscriptions.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => openAuth("signup")}
        >
          Get API Key
        </button>

        <Link href="/models" className={styles.secondary}>
          Discover Models
          <CoinIcon size={17} />
        </Link>
      </div>
    </section>
  );
}
