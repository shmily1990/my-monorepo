import { Button } from "@repo/ui";
import Link from "next/link";

import {
  ArrowLeftIcon,
  BarChartIcon,
  CalendarIcon,
  KeyIcon,
  ListIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

import type { ApiKey } from "../../api-key";
import styles from "./index.module.scss";

/**
 * 详情页的页头：面包屑 + 标题 + 状态徽标 + 元信息 + 右上角两个按钮。
 * 对应 docs/edit.jpg 上半部分。
 *
 * 右上角那两个按钮（Activity / Logs）指向**尚未实现**的路由 —— 与仓库里其它未实现链接
 * 的做法一致（Next 16 的 typed routes 并不收窄 `next/link` 的 `href`，所以类型合法）。
 * 用 antd `Button` 的 `href` 而不是套一层 `Link`，避免出现 `a` 里嵌 `button`。
 */
export function DetailHeader({ apiKey }: { apiKey: ApiKey }) {
  const listHref = "/workspaces/api-keys";

  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumb} aria-label="面包屑">
        <Link
          href={listHref}
          className={styles.back}
          aria-label="返回 API Keys"
        >
          <ArrowLeftIcon size={18} />
        </Link>
        <Link href={listHref} className={styles.crumb}>
          API Keys
        </Link>
        <span className={styles.separator} aria-hidden="true">
          ›
        </span>
        <span className={styles.current}>{apiKey.name}</span>
      </nav>

      <div className={styles.head}>
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{apiKey.name}</h1>
            <span
              className={cn(
                styles.status,
                apiKey.enabled ? styles.enabled : styles.disabled,
              )}
            >
              {apiKey.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <p className={styles.meta}>
            <KeyIcon size={15} className={styles.metaIcon} />
            <span className={styles.mono}>{apiKey.maskedKey}</span>
            <span className={styles.dot} aria-hidden="true">
              •
            </span>
            <CalendarIcon size={15} className={styles.metaIcon} />
            <span>{formatDate(apiKey.createdAt)}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            size="large"
            href={`${listHref}/${apiKey.id}/activity`}
            icon={<BarChartIcon size={16} />}
          >
            Activity
          </Button>
          <Button
            size="large"
            href={`${listHref}/${apiKey.id}/logs`}
            icon={<ListIcon size={16} />}
          >
            Logs
          </Button>
        </div>
      </div>
    </header>
  );
}
