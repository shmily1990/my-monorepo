import Link from "next/link";

import { ACTIVITY_STATS } from "../../data/usage";
import { ActivityHeatmap } from "../activity-heatmap";
import styles from "./index.module.scss";

/**
 * Activity 区块：标题 + 四项统计 + 贡献热力图。
 *
 * 统计用 `<dl>` 而不是一堆 div —— 它们就是成对的「标签 / 数值」，用描述列表语义最准。
 * 四项之间的竖线由 CSS 的 border-left 给（`> * + *`），不用 antd 的 Divider：
 * 那个会强制撑满高度。
 *
 * 右上角那个「Spend」是参考图里的一个入口，指向尚未实现的 /workspaces/activity ——
 * 与仓库里其它未实现链接的做法一致。
 */
export function ActivityPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title}>Activity</h2>
        <Link className={styles.link} href="/workspaces/activity">
          Spend
        </Link>
      </div>

      <dl className={styles.stats}>
        {ACTIVITY_STATS.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <dt className={styles.statLabel}>{stat.label}</dt>
            <dd className={styles.statValue}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <ActivityHeatmap />
    </section>
  );
}
