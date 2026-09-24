import { ClosingCta } from "./components/closing-cta";
import { FeatureCards } from "./components/feature-cards";
import { Hero } from "./components/hero";
import { ProviderBand } from "./components/provider-band";
import { StatsRow } from "./components/stats-row";
import styles from "./index.module.scss";

/**
 * 首页。
 *
 * 只做区块编排，不含任何具体 UI —— 每个区块是 components/ 下的一个子组件。
 * 对应的路由是 app/(marketing)/page.tsx，那个文件只负责 `return <HomePage />`。
 */
export function HomePage() {
  return (
    <main className={styles.page}>
      <Hero />
      <StatsRow />
      <FeatureCards />
      <ProviderBand />
      <ClosingCta />
    </main>
  );
}
