import { ProviderMark } from "@/components/brand/provider-mark";
import { GlobeIcon } from "@/components/icons";
import { PROVIDER_IDS } from "@/lib/providers";

import styles from "./index.module.scss";

/**
 * 推断区块 —— **不在参考图内**。
 *
 * 两张参考图都在首页四张特性卡处截断，这一区块是为了让页面在截断点以下也能收尾
 * 而补的。真实内容请按产品实际文案替换，或整个删掉（它不依赖其它任何东西）。
 */
export function ProviderBand() {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <GlobeIcon size={18} className={styles.icon} />
        <h2 className={styles.title}>One integration, every provider</h2>
        <p className={styles.body}>
          Point your existing OpenAI SDK at OpenRouter and get every model below
          — no per-provider clients, keys or retry logic.
        </p>
      </div>

      <div className={styles.marks} aria-hidden="true">
        {PROVIDER_IDS.map((id) => (
          <ProviderMark key={id} providerId={id} size={44} />
        ))}
      </div>
    </section>
  );
}
