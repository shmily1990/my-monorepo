import { GripIcon } from "@/components/icons";

import styles from "./index.module.scss";

/**
 * 特性卡三：两张互相叠放的迷你图表卡。
 *
 * 折线是写死的点集。这里**不引图表库** —— 图上没有坐标轴、没有刻度、没有 tooltip，
 * 唯一的信息就是「线在抖」，为此装一个图表依赖不划算。
 * preserveAspectRatio="none" 让曲线随卡片宽度拉伸，vectorEffect 保证线宽不被一起拉粗。
 */

type Series = { readonly points: string; readonly color: string };

const THROUGHPUT: readonly Series[] = [
  {
    points: "0,33 14,25 28,29 42,17 56,21 70,11 84,15 100,6 120,10",
    color: "var(--or-info)",
  },
];

const LATENCY: readonly Series[] = [
  {
    points: "0,30 16,20 32,26 48,14 64,24 80,18 96,28 120,22",
    color: "var(--or-success)",
  },
  {
    points: "0,38 16,34 32,37 48,30 64,35 80,32 96,38 120,33",
    color: "#eab308",
  },
];

function Sparkline({ series }: { series: readonly Series[] }) {
  return (
    <svg
      className={styles.chart}
      viewBox="0 0 120 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {series.map((line) => (
        <polyline
          key={line.color}
          points={line.points}
          fill="none"
          stroke={line.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function ChartCard({
  caption,
  series,
  className,
}: {
  caption: string;
  series: readonly Series[];
  className?: string;
}) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.head}>
        <span className={styles.caption}>{caption}</span>
        <GripIcon size={14} className={styles.grip} />
      </div>
      <Sparkline series={series} />
    </div>
  );
}

export function ObservabilityCharts() {
  return (
    <div className={styles.stack} aria-hidden="true">
      <ChartCard caption="Throughput" series={THROUGHPUT} />
      <ChartCard caption="Latency" series={LATENCY} className={styles.front} />
    </div>
  );
}
