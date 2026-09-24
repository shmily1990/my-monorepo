import { ProviderMark } from "@/components/brand/provider-mark";

import styles from "./index.module.scss";

/**
 * 特性卡二：一个模型被路由到多家 provider。
 *
 * 顶部的 slug 胶囊 + 下方分叉到一个 provider 瓦片。分叉线全部由 CSS 边框画出来
 * （见 index.module.scss 里 ::before / ::after 的注释），不用 SVG ——
 * 这样它会随容器宽度自然伸缩，不需要维护 viewBox 坐标。
 */
const ROUTES = ["anthropic", "google", "meta", "mistral"] as const;

export function RoutingTree() {
  return (
    <div className={styles.tree} aria-hidden="true">
      <span className={styles.chip}>anthropic/claude-opus-5</span>

      <div className={styles.trunk} />

      <div className={styles.branches}>
        {ROUTES.map((id) => (
          <div key={id} className={styles.branch}>
            <ProviderMark providerId={id} size={34} />
          </div>
        ))}
      </div>
    </div>
  );
}
