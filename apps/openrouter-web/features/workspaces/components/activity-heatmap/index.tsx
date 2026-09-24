import {
  HEATMAP_LEVELS,
  HEATMAP_MONTHS,
  HEATMAP_ROWS,
  HEATMAP_WEEKS,
} from "../../data/usage";
import styles from "./index.module.scss";

/**
 * 贡献热力图（M/W/F 三行 × 53 周），对应 docs/workspace.jpg 底部那一片。
 *
 * 新账号没有任何用量，所以**所有格子都是 0 档**（空格子）—— 参考图里也就是一片接近空白。
 * 不编造活跃度。
 *
 * 只画三行（周一/周三/周五）而不是完整七天：参考图就是三行采样，不是 7×53。
 * 月份标签用 `space-between` 均匀铺开，不逐列对齐 —— 逐列对齐需要把标签也放进那个 53 列的
 * 网格里，收益只是一个像素级的对齐，不值。
 *
 * 整个热力图对辅助技术隐藏（`aria-hidden`）：53×3 个空方块念出来只是噪音，
 * 而它们承载的信息（"没有活动"）在旁边的 Activity 统计里已经用文字说清楚了。
 */
const WEEK_COLUMNS = Array.from({ length: HEATMAP_WEEKS }, (_, week) => week);
const LEVELS = Array.from({ length: HEATMAP_LEVELS }, (_, level) => level + 1);
const LEVEL_CLASS = [styles.level1, styles.level2, styles.level3];

export function ActivityHeatmap() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.months}>
        {HEATMAP_MONTHS.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {HEATMAP_ROWS.map((row) => (
          <div className={styles.row} key={row}>
            <span className={styles.rowLabel}>{row}</span>
            {WEEK_COLUMNS.map((week) => (
              <span className={styles.cell} key={week} />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <span>Less</span>
        <span className={styles.cell} />
        {LEVELS.map((level, index) => (
          <span
            className={`${styles.cell} ${LEVEL_CLASS[index] ?? ""}`}
            key={level}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
