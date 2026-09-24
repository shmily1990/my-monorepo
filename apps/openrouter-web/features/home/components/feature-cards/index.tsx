import { ObservabilityCharts } from "../observability-charts";
import { ProviderTileGrid } from "../provider-tile-grid";
import { RoutingTree } from "../routing-tree";
import { TrustShield } from "../trust-shield";
import styles from "./index.module.scss";

/**
 * 四张特性卡。
 *
 * 卡片外壳（边框、圆角、内边距）由本组件提供，四个插图组件只画自己的内容 ——
 * 这样卡片的视觉规格只有一处，插图的职责也保持单一。
 *
 * 下面的标题与正文是**推断的**：参考图在这一区间被截断，只看到了四张插图的上半部分，
 * 原文案无从得知。文案取的是每个插图对应的产品卖点，方便日后按真实文案替换。
 */

type Card = {
  art: React.ReactNode;
  title: string;
  body: string;
};

const CARDS: readonly Card[] = [
  {
    art: <ProviderTileGrid />,
    title: "Every model, one API",
    body: "Hundreds of models from every major provider, behind a single endpoint. Switching models is one string.",
  },
  {
    art: <RoutingTree />,
    title: "Automatic routing and failover",
    body: "Requests go to the fastest healthy provider, so one outage never takes your application down with it.",
  },
  {
    art: <ObservabilityCharts />,
    title: "See what you're paying for",
    body: "Throughput, latency and spend per model, tracked continuously so you can route on evidence.",
  },
  {
    art: <TrustShield />,
    title: "Your data stays yours",
    body: "Zero data retention options and no training on your traffic. Auditable at the provider level.",
  },
];

export function FeatureCards() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {CARDS.map((card) => (
          <article key={card.title} className={styles.card}>
            <div className={styles.art}>{card.art}</div>
            <h2 className={styles.title}>{card.title}</h2>
            <p className={styles.body}>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
