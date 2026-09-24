import { formatPrice } from "@/lib/utils/format";

import styles from "./index.module.scss";

/**
 * 「Spend in last 30 days」。对应 docs/edit.jpg 下半部分那张卡。
 *
 * **图表是空的，而且这是诚实的。** 参考图里确实画了几根柱子，但这个账号的消费是 $0.00 ——
 * 柱子与数字对不上。按项目一贯的做法（见 `features/workspaces` 的空态说明），
 * 这里渲染一个空图表框架 + 一句说明，而不是画几根没有来源的柱子。
 *
 * 也没有引图表库：一张没有数据的图不值得一个依赖（同样的判断见
 * `features/home/components/observability-charts`）。
 */
export function SpendCard({
  days,
  amountUsd,
}: {
  days: number;
  amountUsd: number;
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Spend in last {days} days</h2>
      <p className={styles.total}>{formatPrice(amountUsd)}</p>

      <div className={styles.plot} aria-hidden="true" />
      <p className={styles.empty}>Nothing spent in this period.</p>
    </section>
  );
}
