import { formatMonthDay } from "@/lib/utils/format";

import { USAGE_AXIS_DATES } from "../../data/usage";
import styles from "./index.module.scss";

/**
 * 用量图表的框架。
 *
 * **没有图表库**，也不引：参考图在这个账号下就是一张空网格加一条横轴，没有任何数据点。
 * 为一张空图装依赖不划算 —— 同样的判断见
 * `features/home/components/observability-charts`（那里也是手写的折线）。
 *
 * 网格线用 CSS 的 `background-image` + `background-size` 画，不占 DOM 节点：
 * 一层竖线（每 1/6 宽一条）+ 一层横线（每 1/4 高一条）。
 *
 * 横轴标签用 `formatMonthDay`（就是那个不碰 `Date` / `toLocaleDateString` 的实现），
 * 日期本身写在 `data/usage.ts` 里 —— 这个组件不读当前时间。
 */
export function UsageChart() {
  return (
    <div className={styles.wrap}>
      {/* 网格是纯装饰，对辅助技术隐藏；横轴标签承载信息，保持可读 */}
      <div className={styles.plot} aria-hidden="true" />

      <ol className={styles.axis}>
        {USAGE_AXIS_DATES.map((iso) => (
          <li className={styles.tick} key={iso}>
            {formatMonthDay(iso)}
          </li>
        ))}
      </ol>
    </div>
  );
}
