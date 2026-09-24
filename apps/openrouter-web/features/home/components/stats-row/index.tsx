import styles from "./index.module.scss";

/**
 * 四项统计。
 *
 * 数据直接内联 —— 四个字符串常量不值得单独开一个 data 文件。
 * 这些是参考图上的展示数字，来自其截图，不是从任何接口算出来的。
 */
const STATS = [
  { value: "400T+", label: "Monthly Tokens" },
  { value: "10M+", label: "Global Users" },
  { value: "80+", label: "Providers" },
  { value: "500+", label: "Models" },
] as const;

export function StatsRow() {
  return (
    <section className={styles.section} aria-label="平台数据">
      <div className={styles.grid}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
