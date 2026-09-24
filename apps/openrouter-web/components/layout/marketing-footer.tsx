import Link from "next/link";

import { OpenRouterLogo } from "@/components/brand/openrouter-logo";
import { FOOTER_COLUMNS, FOOTER_LEGAL } from "@/lib/site-nav";

import styles from "./marketing-footer.module.scss";

/**
 * marketing 路由组共用的页脚。
 *
 * 链接列与 header 共用 lib/site-nav.ts 的数据。
 *
 * 刻意不写 `© {new Date().getFullYear()}`：静态路由下这个值在构建期就被固化了，
 * 会随时钟变旧；而若改为客户端渲染又会与服务端结果不一致。这类"聪明"的写法
 * 带来的麻烦大于收益，所以底部只留一句不带年份的文字。
 */
export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <OpenRouterLogo size={26} />
          <p className={styles.tagline}>
            The unified interface for every model.
          </p>
        </div>

        <div className={styles.columns}>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <h2 className={styles.columnTitle}>{column.title}</h2>
              <ul className={styles.columnList}>
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>OpenRouter</span>
        <ul className={styles.legal}>
          {FOOTER_LEGAL.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
