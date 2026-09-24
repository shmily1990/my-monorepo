"use client";

import Link from "next/link";

import { useAuthDialog } from "@/features/auth";

import styles from "./index.module.scss";

/**
 * 推断区块 —— **不在参考图内**（同上，见 provider-band 的说明）。
 * 收尾的行动号召，样式上刻意与首屏的两个按钮保持一致，让页面首尾呼应。
 *
 * 客户端组件，原因同 hero：「Get API Key」要打开登录弹框，而不是跳向一个不存在的
 * `/signup` 路由。
 */
export function ClosingCta() {
  const { openAuth } = useAuthDialog();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Start building with every model</h2>
        <p className={styles.body}>
          Free to start. Pay only for the tokens you use.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => openAuth("signup")}
          >
            Get API Key
          </button>
          <Link href="/docs" className={styles.secondary}>
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
