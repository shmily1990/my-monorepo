import { ProviderMark } from "@/components/brand/provider-mark";
import { PROVIDER_IDS } from "@/lib/providers";

import styles from "./index.module.scss";

/**
 * 特性卡一：一格格的 provider 瓦片。
 *
 * 参考图里这些是各家的彩色 logo，这里按项目决策统一换成中性占位块。
 * 整块是纯装饰（卡片的标题与正文已经说明了它的意思），所以对辅助技术整体隐藏 ——
 * 否则读屏会连着念出十几个 provider 名字。
 */
export function ProviderTileGrid() {
  return (
    <div className={styles.grid} aria-hidden="true">
      {PROVIDER_IDS.map((id) => (
        <ProviderMark key={id} providerId={id} size={38} />
      ))}
    </div>
  );
}
