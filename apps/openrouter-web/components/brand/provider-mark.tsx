import { getProvider } from "@/lib/providers";

import styles from "./provider-mark.module.scss";

/**
 * provider 占位标记。
 *
 * **这里刻意不做品牌区分**：所有 provider 用同一个中性几何块，没有品牌色、没有品牌 logo、
 * 没有首字母 —— 第三方商标素材既不引入仓库，也不联网获取（理由同根 layout 否决 next/font）。
 * 所以参考图里那些彩色 logo 瓦片在视觉上会被这组中性块替代。
 *
 * provider 的身份没有丢失，只是不走视觉：通过 aria-label 暴露给辅助技术，
 * 页面上则由相邻的模型名与元信息行（"by cohere"）承担辨识。
 *
 * 将来若要换成真实 logo，改这一个文件即可 —— 调用点只传 providerId。
 */
export function ProviderMark({
  providerId,
  size = 24,
  className,
}: {
  providerId: string;
  size?: number;
  className?: string;
}) {
  const { label } = getProvider(providerId);

  return (
    <span
      className={[styles.mark, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="8" />
      </svg>
    </span>
  );
}
