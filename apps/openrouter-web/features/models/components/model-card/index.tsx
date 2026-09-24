import { ProviderMark } from "@/components/brand/provider-mark";
import { BatchIcon, InfoIcon, VisionIcon } from "@/components/icons";
import { getProvider } from "@/lib/providers";
import {
  formatContext,
  formatDate,
  formatPrice,
  formatTokens,
} from "@/lib/utils/format";

import type { Model } from "../../model";
import styles from "./index.module.scss";

/**
 * 模型列表里的一张卡片。
 *
 * 纯展示，没有状态也不需要 antd，所以是**服务端组件** —— 它是这一页里唯一
 * 可能被大量渲染的东西，留在服务端能少往客户端包塞东西。
 * （它被客户端组件 models/index.tsx 引用，因此实际仍会参与客户端渲染；
 * 重要的是它自身不含交互与依赖。）
 */
export function ModelCard({ model }: { model: Model }) {
  const provider = getProvider(model.providerId);

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.identity}>
          <ProviderMark providerId={model.providerId} size={26} />

          <h3 className={styles.name}>{model.name}</h3>

          {model.modalities.includes("text") ? (
            <span
              className={styles.textBadge}
              role="img"
              aria-label="支持文本输入"
            >
              T
            </span>
          ) : null}

          {model.badges.includes("vision") ? (
            <VisionIcon size={16} className={styles.badgeIcon} />
          ) : null}

          {model.badges.includes("batch") ? (
            <BatchIcon size={16} className={styles.badgeIcon} />
          ) : null}
        </div>

        <div className={styles.volume}>
          <span>{formatTokens(model.monthlyTokens)} tokens</span>
          <InfoIcon size={15} className={styles.volumeIcon} />
        </div>
      </div>

      <p className={styles.description}>{model.description}</p>

      <div className={styles.meta}>
        <span>by {provider.label}</span>
        <span>{formatDate(model.releasedAt)}</span>
        <span>{formatContext(model.contextLength)} context</span>
        <span>{formatPrice(model.inputPricePerMillion)}/M input tokens</span>
        <span>{formatPrice(model.outputPricePerMillion)}/M output tokens</span>
      </div>
    </article>
  );
}
