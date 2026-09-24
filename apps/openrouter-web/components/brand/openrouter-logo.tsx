import styles from "./openrouter-logo.module.scss";

/**
 * 品牌标记 + 文字标。
 *
 * 图形部分是**手绘近似**，不是官方素材 —— 与 provider 占位块同样的取舍：不引入、不联网抓取
 * 第三方商标。配色取自 styles/tokens.scss 的 --or-brand，与 packages/ui 的主题同源。
 * 文字标就是文本，因此链接的可访问名由它承担，图形本身只作装饰（aria-hidden）。
 */
export function OpenRouterLogo({ size = 30 }: { size?: number }) {
  return (
    <span className={styles.logo}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className={styles.mark}
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" fill="var(--or-brand)" />
        <circle
          cx="13"
          cy="16"
          r="5.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
        />
        <circle
          cx="19"
          cy="16"
          r="5.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
        />
      </svg>

      <span className={styles.wordmark}>openrouter</span>
    </span>
  );
}
